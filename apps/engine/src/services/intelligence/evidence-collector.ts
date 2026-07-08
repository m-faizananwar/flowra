import supabase from "../lib/supabase";
import { CONTEXT_LIMITS } from "./constants";

function isSystemMessage(message) {
  const content = (message.content || "").trim();
  if (!content) return true;
  if (content.startsWith("(System Sync:")) return true;
  if (message.metadata?.author?.bot || message.metadata?.from?.is_bot) return true;
  return false;
}

class EvidenceCollector {
  async collect({ userId, windowStart, windowEnd }) {
    const integrations = await this.getIntegrations(userId);
    const integrationIds = integrations.map((integration) => integration.id);

    const [messages, githubEvents] = await Promise.all([
      this.getMessages(integrationIds, windowStart, windowEnd),
      this.getGithubEvents(userId, windowStart, windowEnd),
    ]);

    return {
      integrations,
      messages,
      githubEvents,
    };
  }

  async getIntegrations(userId) {
    const { data, error } = await supabase
      .from("integrations")
      .select("id, service_name, is_active")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) throw error;
    return data || [];
  }

  async getMessages(integrationIds, windowStart, windowEnd) {
    if (integrationIds.length === 0) return [];

    const { data, error } = await supabase
      .from("messages")
      .select("id, integration_id, channel_id, sender_name, content, metadata, created_at, synced_at, channels(name)")
      .in("integration_id", integrationIds)
      .gte("created_at", windowStart.toISOString())
      .lt("created_at", windowEnd.toISOString())
      .order("created_at", { ascending: true })
      .limit(CONTEXT_LIMITS.maxMessageItems);

    if (error) throw error;
    return (data || []).filter((message) => !isSystemMessage(message));
  }

  async getGithubEvents(userId, windowStart, windowEnd) {
    const { data, error } = await supabase
      .from("github_events")
      .select("id, repository_id, repo_full_name, event_type, action, sender_login, member_id, title, url, ref, occurred_at")
      .eq("user_id", userId)
      .gte("occurred_at", windowStart.toISOString())
      .lt("occurred_at", windowEnd.toISOString())
      .order("occurred_at", { ascending: true })
      .limit(CONTEXT_LIMITS.maxGithubItems);

    if (error) throw error;
    return data || [];
  }
}

export default new EvidenceCollector();
