const supabase = require("../lib/supabase");
const logger = require("../lib/logger");
const jiraSync = require("../jira-sync");

class ApprovalWatcher {
  constructor() {
    this.channel = null;
  }

  start() {
    logger.info("Starting REALTIME Approval Watcher (Human-in-the-Loop Executor).");
    
    // 1. Initial check for any requests that were approved while we were offline
    this.processAllPendingApprovals();

    // 2. Setup Realtime Subscription to listen for "Approved" clicks
    this.channel = supabase
      .channel('approval-clicks')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'approval_requests',
        filter: 'status=eq.approved' // Only listen for transitions to 'approved'
      }, (payload) => {
        logger.info(`[Watcher] REALTIME Signal: New approval detected for request ${payload.new.id}`);
        this.executeJiraTransition(payload.new);
      })
      .subscribe((status) => {
        logger.info(`[Watcher] Supabase Realtime status: ${status}`);
      });
  }

  async processAllPendingApprovals() {
    try {
      const { data: requests, error } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("status", "approved")
        .eq("request_type", "jira_transition")
        .not("user_id", "is", null); // Ensure user_id is always present — skip orphaned records

      if (error) throw error;
      if (requests && requests.length > 0) {
        logger.info(`[Watcher] Found ${requests.length} pending approvals on startup across ${new Set(requests.map(r => r.user_id)).size} user(s).`);
        for (const request of requests) {
          // Guard: skip any record that somehow has no user_id
          if (!request.user_id) {
            logger.warn(`[Watcher] Skipping approval ${request.id} — missing user_id.`);
            continue;
          }
          await this.executeJiraTransition(request);
        }
      }
    } catch (err) {
      logger.error(`[Watcher] Initial approval check failed: ${err.message}`);
    }
  }

  async executeJiraTransition(request) {
    try {
      const { payload, user_id } = request;
      const { issue_key, target_status, reason } = payload;

      logger.info(
        `[Watcher] Executing approved move for ${issue_key} to ${target_status}...`,
      );

      // 1. Find the integration ID for this user
      const { data: integration } = await supabase
        .from("integrations")
        .select("id")
        .eq("user_id", user_id)
        .eq("service_name", "jira")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!integration) {
        throw new Error(`No active Jira integration found for user ${user_id}`);
      }

      // 2. Execute the move in Jira
      await jiraSync.executeMovement(
        integration.id,
        issue_key,
        target_status,
        `Flowra: Automatically moved based on human approval. ${reason}`,
      );

      // 3. INSTANT UPDATE: Update the local jira_issues cache immediately
      // This triggers the Realtime Pulse on the Kanban board!
      await supabase
        .from("jira_issues")
        .update({
          status: target_status,
          last_synced_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("issue_key", issue_key);

      // 4. Mark the request as executed — scoped to both id AND user_id to prevent cross-user mutation
      await supabase
        .from("approval_requests")
        .update({
          status: "executed", 
          updated_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id)
        .eq("user_id", user_id); // Double-guard: ensure we only update OUR record

      logger.info(`[Watcher] Successfully moved and updated ${issue_key} locally.`);
    } catch (error) {
      logger.error(
        `[Watcher] Failed to execute transition for ${request.id}: ${error.message}`,
      );
    }
  }
}

module.exports = new ApprovalWatcher();
