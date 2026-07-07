const supabase = require("../lib/supabase");
const logger = require("../lib/logger");
const evidenceCollector = require("./evidence-collector");
const identityResolver = require("./identity-resolver");
const contextBuilder = require("./context-builder");
const memoryService = require("./memory-service");
const riskSkill = require("./risk-skill");
const evaluationSkill = require("./evaluation-skill");
const jiraSkill = require("./jira-skill");
const jiraCache = require("./jira-cache");
const sprintSync = require("./sprint-sync");
const approvalBuffer = require("./approval-buffer");
const { DEFAULT_METRICS, MODEL_NAME, PROMPT_VERSION } = require("./constants");
const geminiJsonClient = require("./gemini-json-client");

class AnalysisRunner {
  async run({ userId, analysisType, window, syncOnly = false }) {
    const idempotencyKey = syncOnly ? `${window.idempotencyKey}:sync` : window.idempotencyKey;
    const existing = await this.findExistingRun(idempotencyKey);
    if (existing && ["running", "completed"].includes(existing.status)) {
      logger.info(`Skipping ${analysisType} analysis; run already exists: ${idempotencyKey}`);
      return existing;
    }

    const run = await this.createRun({ userId, analysisType, window, idempotencyKey });

    try {
      logger.info(`Starting ${analysisType} analysis for user ${userId} ${syncOnly ? '(FAST PATH SYNC)' : ''}`);

      // --- FAST PATH: For syncOnly, bypass all AI preparation steps ---
      if (syncOnly && analysisType === "jira") {
        const jiraIntegration = await this.getJiraIntegration(userId);
        if (jiraIntegration) {
          try {
            await sprintSync.syncForUser(userId);
          } catch (e) {
            logger.warn(`[D3] Sprint sync error in fast path: ${e.message}`);
          }
          return this.markRun(run.id, "completed", {
            completed_at: new Date().toISOString(),
            metadata: { sync_only: true, path: 'fast' },
          });
        } else {
          logger.warn("[D1] No Jira integration found for user in fast path.");
          throw new Error("No Jira integration found.");
        }
      }

      // --- STANDARD PATH: Requires AI context preparation ---
      const [identityMap, previousMemory, metrics, evidence] = await Promise.all([
        identityResolver.buildIdentityMap(userId),
        memoryService.getLatest(userId),
        this.ensureMetrics(userId),
        evidenceCollector.collect({
          userId,
          windowStart: window.windowStart,
          windowEnd: window.windowEnd,
        }),
      ]);

      const chunks = await contextBuilder.buildAndStore({
        userId,
        runId: run.id,
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
        evidence,
      });

      logger.info(`[DEBUG] Collected Evidence: ${evidence.githubEvents.length} GitHub events, ${evidence.messages.length} Chat messages.`);
      logger.info(`[DEBUG] Generated ${chunks.length} Context Chunks for AI analysis.`);

      const memberEvalSpecs = identityMap.members.map((member) => ({
        member_id: member.member_id,
        member_name: member.name,
        role: member.role || null,
        applicable_metrics: this.resolveMetricsForMember(metrics, member),
      }));

      const context = {
        windowStart: window.windowStart.toISOString(),
        windowEnd: window.windowEnd.toISOString(),
        projectMemoryText: memoryService.format(previousMemory),
        identityMap,
        metrics: metrics.map((metric) => ({
          id: metric.id,
          name: metric.name,
          role: metric.role,
          member_id: metric.member_id,
          description: metric.description,
          weight: Number(metric.weight || 1),
        })),
        memberEvalSpecs,
        chunks,
      };

      await memoryService.update({
        userId,
        runId: run.id,
        previousMemory,
        chunks,
      });

      const model = geminiJsonClient.isConfigured() ? MODEL_NAME : "deterministic-fallback";

      if (analysisType === "risk") {
        const result = await riskSkill.assess(context);
        await approvalBuffer.storeRiskResults({
          userId,
          run,
          result,
          knownMemberIds: identityMap.members.map((member) => member.member_id),
          knownRepositoryIds: evidence.githubEvents.map((event) => event.repository_id).filter(Boolean),
          model,
          promptVersion: PROMPT_VERSION,
        });
      } else if (analysisType === "evaluation") {
        const result = await evaluationSkill.evaluate(context);
        await approvalBuffer.storeEvaluationResults({
          userId,
          run,
          result,
          metrics,
          identityMap,
          model,
          promptVersion: PROMPT_VERSION,
        });
      } else if (analysisType === "jira") {
        // --- Phase D1: Extract Jira keys from chunks and enrich context ---
        const jiraIntegration = await this.getJiraIntegration(userId);
        let jiraCards = {};

        if (jiraIntegration) {
          const JiraAPI = require("../lib/jira-api");
          const jiraClient = new JiraAPI(jiraIntegration);
          
          const issueKeys = jiraCache.extractKeysFromChunks(chunks);
          if (issueKeys.length > 0) {
            jiraCards = await jiraCache.fetchAndCache({
              jiraClient,
              userId,
              integrationId: jiraIntegration.id,
              issueKeys,
            });
          }

          // D3: Sync sprint data (BROAD SYNC) - Always run this
          try {
            await sprintSync.syncForUser(userId);
          } catch (e) {
            logger.warn(`[D3] Sprint sync error: ${e.message}`);
          }

          // 2. Fetch ALL other active cards in the project for Zero-Key matching
          const { data: allActiveCards } = await supabase
            .from("jira_issues")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .limit(50);
          
          context.availableCards = allActiveCards || [];

          // 3. Fetch past REJECTIONS to give the AI "Memory"
          const { data: pastRejections } = await supabase
            .from("approval_requests")
            .select("payload, created_at")
            .eq("user_id", userId)
            .eq("request_type", "jira_transition")
            .eq("status", "rejected")
            .order("created_at", { ascending: false })
            .limit(20);

          context.rejectedHistory = (pastRejections || []).map(r => ({
            issue_key: r.payload?.issue_key,
            target_status: r.payload?.target_status,
            rejected_at: r.created_at
          }));

          // 4. Inject live sprint context so the AI knows delivery state
          const { data: activeSprints } = await supabase
            .from("sprints")
            .select("*, sprint_metrics(*)")
            .eq("user_id", userId)
            .eq("state", "active")
            .order("start_date", { ascending: false })
            .limit(3);

          if (activeSprints && activeSprints.length > 0) {
            context.sprintSummary = activeSprints.map(sprint => {
              const m = sprint.sprint_metrics?.[sprint.sprint_metrics.length - 1];
              const lines = [
                `Sprint: "${sprint.name}" (Project: ${sprint.project_key})`,
                `  Dates: ${sprint.start_date ? sprint.start_date.slice(0, 10) : "?"} → ${sprint.end_date ? sprint.end_date.slice(0, 10) : "?"}`,
              ];
              if (sprint.goal) lines.push(`  Goal: ${sprint.goal}`);
              if (m) {
                lines.push(`  Issues: ${m.completed_issues}/${m.total_issues} done | ${m.in_progress_issues} in-progress | ${m.todo_issues} to-do`);
                lines.push(`  Story Points: ${m.story_points_completed}/${m.story_points_total} | Velocity: ${m.velocity}%`);
              }
              return lines.join("\n");
            }).join("\n\n");
          }
        }

        const enrichedContext = { ...context, jiraCards };
        const result = await jiraSkill.assess(enrichedContext);
        await approvalBuffer.storeJiraResults({
          userId,
          run,
          result,
          model,
          promptVersion: PROMPT_VERSION,
        });
        // Store any new task creation suggestions from the AI
        if (result.creations?.length > 0) {
          await approvalBuffer.storeJiraCreations({
            userId,
            run,
            creations: result.creations,
            model,
            promptVersion: PROMPT_VERSION,
          });
        }
      } else {
        throw new Error(`Unsupported analysis type: ${analysisType}`);
      }

      return this.markRun(run.id, "completed", {
        completed_at: new Date().toISOString(),
        metadata: {
          message_count: evidence.messages.length,
          github_event_count: evidence.githubEvents.length,
          chunk_count: chunks.length,
        },
      });
    } catch (error) {
      logger.error(`Analysis run failed (${analysisType}): ${error.message}`);
      await this.markRun(run.id, "failed", {
        completed_at: new Date().toISOString(),
        error: error.message,
      });
      return null;
    }
  }

  async findExistingRun(idempotencyKey) {
    const { data, error } = await supabase
      .from("analysis_runs")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async createRun({ userId, analysisType, window, idempotencyKey }) {
    const { data, error } = await supabase
      .from("analysis_runs")
      .insert({
        user_id: userId,
        analysis_type: analysisType,
        idempotency_key: idempotencyKey,
        scheduled_for_date: window.scheduledForDate,
        window_start: window.windowStart.toISOString(),
        window_end: window.windowEnd.toISOString(),
        status: "running",
        model: geminiJsonClient.isConfigured() ? MODEL_NAME : "deterministic-fallback",
        prompt_version: PROMPT_VERSION,
        started_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  async markRun(runId, status, updates = {}) {
    const { data, error } = await supabase
      .from("analysis_runs")
      .update({
        status,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  resolveMetricsForMember(metrics, member) {
    const memberSpecific = metrics.filter(
      (m) => m.member_id === member.member_id
    );
    if (memberSpecific.length > 0) {
      return memberSpecific.map((m) => ({ id: m.id, name: m.name, description: m.description, weight: Number(m.weight || 1) }));
    }
    const roleSpecific = metrics.filter(
      (m) => m.role && m.role === (member.role || null) && !m.member_id
    );
    if (roleSpecific.length > 0) {
      return roleSpecific.map((m) => ({ id: m.id, name: m.name, description: m.description, weight: Number(m.weight || 1) }));
    }
    return metrics
      .filter((m) => !m.role && !m.member_id)
      .map((m) => ({ id: m.id, name: m.name, description: m.description, weight: Number(m.weight || 1) }));
  }

  async ensureMetrics(userId) {
    const { data: existing, error } = await supabase
      .from("evaluation_metrics")
      .select("*")
      .eq("user_id", userId)
      .eq("is_enabled", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (existing && existing.length > 0) return existing;

    const { data, error: insertError } = await supabase
      .from("evaluation_metrics")
      .insert(DEFAULT_METRICS.map((metric) => ({
        user_id: userId,
        name: metric.name,
        description: metric.description,
        weight: metric.weight,
        is_enabled: true,
      })))
      .select("*");
    if (insertError) throw insertError;
    return data || [];
  }

  async getJiraIntegration(userId) {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("service_name", "jira")
      .eq("is_active", true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      logger.warn(`getJiraIntegration failed: ${error.message}`);
      return null;
    }
    return data;
  }
}

module.exports = new AnalysisRunner();
