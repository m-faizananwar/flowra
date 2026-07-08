import supabase from "../lib/supabase";
import crypto from "crypto";
import logger from "../lib/logger";

function weightedTotal(metricScores: any[], metrics: any[]) {
  const weights = new Map(metrics.map((metric: any) => [metric.id, Number(metric.weight || 1)]));
  let weighted = 0;
  let totalWeight = 0;

  for (const metricScore of metricScores) {
    const weight: number = weights.get(metricScore.metric_id) || 1;
    weighted += Number(metricScore.score || 0) * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : Math.round((weighted / totalWeight) * 100) / 100;
}

function intersect(values, allowed) {
  const allowedSet = new Set(allowed);
  return (values || []).filter((value) => allowedSet.has(value));
}

class ApprovalBuffer {
  async storeEvaluationResults({ userId, run, result, metrics, identityMap, model, promptVersion }) {
    const allowedMembers = identityMap.members.map((member) => member.member_id);
    const created = [];

    for (const evaluation of result.evaluations || []) {
      if (!allowedMembers.includes(evaluation.member_id)) continue;
      const totalScore = weightedTotal(evaluation.metrics || [], metrics);
      const evidenceRefs = (evaluation.metrics || []).flatMap((metric) => metric.evidence_refs || []);

      const { data: record, error } = await supabase
        .from("member_evaluations")
        .insert({
          user_id: userId,
          analysis_run_id: run.id,
          member_id: evaluation.member_id,
          status: "pending",
          evaluation_date: run.scheduled_for_date,
          window_start: run.window_start,
          window_end: run.window_end,
          total_score: totalScore,
          metric_scores: evaluation.metrics || [],
          summary: evaluation.summary || "",
          evidence_refs: evidenceRefs,
          model,
          prompt_version: promptVersion,
        })
        .select("*")
        .single();

      if (error) throw error;
      created.push(record);

      await this.createApprovalRequest({
        userId,
        requestType: "member_evaluation",
        targetId: record.id,
        title: `Review member evaluation`,
        summary: `${record.summary || "Daily member evaluation"} Total score: ${record.total_score}`,
        payload: record,
      });
    }

    if (created.length > 0) {
      await this.createNotification({
        userId,
        type: "member_evaluation",
        title: "Daily member evaluations ready",
        body: `${created.length} member evaluation${created.length === 1 ? "" : "s"} require review.`,
        targetType: "member_evaluation",
      });
    }

    return created;
  }

  async storeRiskResults({ userId, run, result, knownMemberIds, knownRepositoryIds, model, promptVersion }) {
    const created = [];

    for (const risk of result.risks || []) {
      const { data: record, error } = await supabase
        .from("risk_assessments")
        .insert({
          user_id: userId,
          analysis_run_id: run.id,
          status: "pending",
          risk_date: run.scheduled_for_date,
          window_start: run.window_start,
          window_end: run.window_end,
          title: risk.title,
          description: risk.description,
          category: risk.category || "project",
          severity: risk.severity || "medium",
          confidence: risk.confidence || 0.5,
          affected_member_ids: intersect(risk.affected_member_ids, knownMemberIds),
          affected_repo_ids: intersect(risk.affected_repo_ids, knownRepositoryIds),
          recommendations: risk.recommendations || [],
          evidence_refs: risk.evidence_refs || [],
          model,
          prompt_version: promptVersion,
        })
        .select("*")
        .single();

      if (error) throw error;
      created.push(record);

      await this.createApprovalRequest({
        userId,
        requestType: "risk_assessment",
        targetId: record.id,
        title: `Review risk: ${record.title}`,
        summary: `${record.severity.toUpperCase()} - ${record.description}`,
        payload: record,
      });
    }

    if (created.length > 0) {
      await this.createNotification({
        userId,
        type: "risk_assessment",
        title: "Daily risk assessment ready",
        body: `${created.length} risk card${created.length === 1 ? "" : "s"} require review.`,
        targetType: "risk_assessment",
      });
    }

    return created;
  }

  async storeJiraResults({ userId, run, result, model, promptVersion }) {
    const created = [];

    for (const transition of result.transitions || []) {
      // ── DEDUPLICATION CHECK ──
      // Skip if a pending or approved request already exists for this issue_key.
      // This prevents duplicates when the user clicks "Sync Now" multiple times.
      const { data: existing } = await supabase
        .from("approval_requests")
        .select("id, status")
        .eq("user_id", userId)
        .eq("request_type", "jira_transition")
        .neq("status", "rejected") // Skip if it's pending, approved, or executed
        .filter("payload->>issue_key", "eq", transition.issue_key)
        .maybeSingle();

      if (existing) {
        logger.info(`[DEDUP] Skipping ${transition.issue_key} — already has a '${existing.status}' request (id: ${existing.id}).`);
        continue;
      }

      const targetId = crypto.randomUUID();
      const payload = {
        id: targetId,
        user_id: userId,
        analysis_run_id: run.id,
        issue_key: transition.issue_key,
        target_status: transition.target_status,
        reason: transition.reason,
        evidence_refs: transition.evidence_refs || [],
        model,
        prompt_version: promptVersion,
        created_at: new Date().toISOString()
      };

      await this.createApprovalRequest({
        userId,
        requestType: "jira_transition",
        targetId,
        title: `Jira: Move ${transition.issue_key} to ${transition.target_status}`,
        summary: transition.reason,
        payload,
      });
      created.push(payload);
    }

    if (created.length > 0) {
      await this.createNotification({
        userId,
        type: "jira_transition",
        title: "Jira transitions suggested",
        body: `${created.length} card movement${created.length === 1 ? "" : "s"} require review.`,
        targetType: "jira_transition",
      });
    }

    return created;
  }

  async storeJiraCreations({ userId, run, creations, model, promptVersion }) {
    const created = [];

    for (const creation of creations || []) {
      // Skip very low confidence suggestions
      if ((creation.confidence || 0) < 0.45) {
        logger.info(`[JIRA-CREATE] Skipping low-confidence creation: "${creation.summary}" (${creation.confidence})`);
        continue;
      }

      // Dedup: skip if a pending creation with the same summary already exists
      const { data: existing } = await supabase
        .from("approval_requests")
        .select("id")
        .eq("user_id", userId)
        .eq("request_type", "jira_creation")
        .eq("status", "pending")
        .filter("payload->>summary", "eq", creation.summary)
        .maybeSingle();

      if (existing) {
        logger.info(`[JIRA-CREATE] Skipping duplicate creation: "${creation.summary}"`);
        continue;
      }

      const targetId = crypto.randomUUID();
      const payload = {
        id: targetId,
        user_id: userId,
        analysis_run_id: run.id,
        summary: creation.summary,
        description: creation.description || "",
        issue_type: creation.issue_type || "Task",
        priority: creation.priority || "Medium",
        reason: creation.reason,
        confidence: creation.confidence || 0.6,
        evidence_refs: creation.evidence_refs || [],
        model,
        prompt_version: promptVersion,
        created_at: new Date().toISOString(),
      };

      await this.createApprovalRequest({
        userId,
        requestType: "jira_creation",
        targetId,
        title: `Create Jira task: "${creation.summary}"`,
        summary: creation.reason,
        payload,
      });
      created.push(payload);
      logger.info(`[JIRA-CREATE] Suggested new task: "${creation.summary}" (confidence: ${creation.confidence})`);
    }

    if (created.length > 0) {
      await this.createNotification({
        userId,
        type: "jira_creation",
        title: "New Jira tasks suggested",
        body: `${created.length} new task${created.length === 1 ? "" : "s"} detected from team activity. Review and create them in Jira.`,
        targetType: "jira_creation",
      });
    }

    return created;
  }

  async createApprovalRequest({ userId, requestType, targetId, title, summary, payload }) {
    const { error } = await supabase
      .from("approval_requests")
      .insert({
        user_id: userId,
        request_type: requestType,
        target_id: targetId,
        title,
        summary,
        payload,
      });
    if (error) throw error;
  }

  async createNotification({ userId, type, title, body, targetType, targetId = null }) {
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        body,
        target_type: targetType,
        target_id: targetId,
      });
    if (error) throw error;
  }
}

export default new ApprovalBuffer();
