import { createClient } from "@supabase/supabase-js";
import JiraAPI from "../lib/jira-api";
import JiraCache from "./jira-cache";
import logger from "../lib/logger";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Phase D3: Sprint Sync Service
 * Fetches sprint data from Jira and stores it in the sprints + sprint_metrics tables.
 * This powers the Sprint Analytics dashboard page.
 */
class SprintSync {
  /**
   * Sync sprints and metrics for a single user's Jira integration
   */
  async syncForUser(userId) {
    logger.info(`[D3] Starting sprint sync for user ${userId}`);

    // 1. Get the user's Jira integration
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("service_name", "jira")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !integration) {
      logger.warn(`[D3] No Jira integration found for user ${userId}`);
      return null;
    }

    const jiraClient = new JiraAPI(integration);

    try {
      // 2. Get all boards
      const boards = await jiraClient.getBoards();
      logger.info(`[D3] Found ${boards.length} Jira board(s).`);

      for (const board of boards) {
        await this.syncBoardSprint(jiraClient, integration, userId, board);
      }
    } catch (err) {
      logger.error(`[D3] Sprint sync failed: ${err.message}`);
    }
  }

  async syncBoardSprint(jiraClient, integration, userId, board) {
    try {
      // 3. Try to get the active sprint, but DON'T stop if none is found
      const sprint = await jiraClient.getActiveSprint(board.id);
      const projectKey = board.location?.projectKey || board.name.split(" ")[0];

      if (!sprint) {
        logger.info(
          `[D3] No active sprint on board "${board.name}", but performing full project mirror for "${projectKey}"...`,
        );
      } else {
        logger.info(
          `[D3] Active sprint: "${sprint.name}" (ID: ${sprint.id}) on board "${board.name}"`,
        );
      }

      // 4. Upsert sprint record (only if sprint exists)
      let sprintRow = null;
      if (sprint) {
        const { data: row, error: sprintErr } = await supabase
          .from("sprints")
          .upsert(
            {
              user_id: userId,
              integration_id: integration.id,
              project_key: projectKey,
              jira_sprint_id: sprint.id,
              board_id: board.id,
              name: sprint.name,
              state: sprint.state,
              start_date: sprint.startDate || null,
              end_date: sprint.endDate || null,
              complete_date: sprint.completeDate || null,
              goal: sprint.goal || "",
              last_synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,jira_sprint_id" },
          )
          .select("id")
          .single();

        sprintRow = row;
        if (sprintErr) {
          logger.warn(`[D3] Sprint upsert failed: ${sprintErr.message}`);
        }
      }

      // 5. Fetch all issues in this project/board for mirroring
      const issues = await jiraClient.getSprintIssues(
        board.id,
        sprint?.id,
        projectKey,
      );
      logger.info(
        `[D3] Board "${board.name}" sync: Received ${issues.length} issues.`,
      );

      // NEW: Bulk cache all issues so the board matches Jira exactly
      // We pass projectKey so that any cards deleted in Jira are purged from our local DB
      await JiraCache.bulkCache({
        userId,
        integrationId: integration.id,
        issues,
        projectKey,
      });

      // 6. Calculate and save metrics ONLY if a sprint exists
      if (sprint && sprintRow) {
        const total = issues.length;
        const completed = issues.filter((i) => {
          const s = (i.fields?.status?.name || "").toLowerCase();
          return ["done", "closed", "resolved", "completed"].includes(s);
        }).length;
        const inProgress = issues.filter((i) => {
          const s = (i.fields?.status?.name || "").toLowerCase();
          return [
            "in progress",
            "under review",
            "development",
            "testing",
            "progress",
          ].some((kw) => s.includes(kw));
        }).length;
        const todo = total - completed - inProgress;

        const storyPointsTotal = issues.reduce(
          (sum, i) =>
            sum + (i.fields?.customfield_10016 || i.fields?.story_points || 0),
          0,
        );
        const storyPointsDone = issues
          .filter((i) => {
            const s = (i.fields?.status?.name || "").toLowerCase();
            return ["done", "closed", "resolved", "completed"].includes(s);
          })
          .reduce(
            (sum, i) =>
              sum +
              (i.fields?.customfield_10016 || i.fields?.story_points || 0),
            0,
          );

        const velocity = total > 0 ? Math.round((completed / total) * 100) : 0;
        const completionRate =
          storyPointsTotal > 0
            ? Math.round((storyPointsDone / storyPointsTotal) * 100)
            : 0;

        const { error: metricsErr } = await supabase
          .from("sprint_metrics")
          .insert({
            user_id: userId,
            sprint_id: sprintRow.id,
            total_issues: total,
            completed_issues: completed,
            in_progress_issues: inProgress,
            todo_issues: todo,
            story_points_total: storyPointsTotal,
            story_points_completed: storyPointsDone,
            velocity,
            completion_rate: completionRate,
            calculated_at: new Date().toISOString(),
          });

        if (metricsErr) {
          logger.warn(`[D3] Metrics insert failed: ${metricsErr.message}`);
        } else {
          logger.info(
            `[D3] Sprint metrics saved: ${completed}/${total} done (${velocity}% velocity), ${storyPointsDone}/${storyPointsTotal} story points.`,
          );
        }
      }
    } catch (err) {
      logger.error(
        `[D3] Board sprint sync error for board ${board.id}: ${err.message}`,
      );
    }
  }
}

export default new SprintSync();
