const supabase = require("../lib/supabase");
const logger = require("../lib/logger");

function getEventTitle(eventName, payload) {
  if (eventName === "push") {
    return `${payload.commits?.length || 0} commit(s) pushed to ${payload.ref || "unknown ref"}`;
  }
  if (eventName === "pull_request") {
    return `[PR] ${payload.pull_request?.title || payload.action}`;
  }
  if (eventName === "check_run") {
    const status = payload.check_run?.conclusion || payload.check_run?.status;
    return `[BUILD] ${payload.check_run?.name}: ${status?.toUpperCase()}`;
  }
  if (eventName === "status") {
    return `[STATUS] ${payload.context}: ${payload.state?.toUpperCase()}`;
  }
  if (eventName === "workflow_run") {
    return `[CI/CD] ${payload.workflow?.name}: ${payload.workflow_run?.conclusion || payload.workflow_run?.status}`;
  }
  if (eventName === "pull_request_review") {
    return `[REVIEW] ${payload.action} on ${payload.pull_request?.title || "PR"}`;
  }
  return `GitHub ${eventName}${payload.action ? `/${payload.action}` : ""}`;
}

function getEventUrl(eventName, payload) {
  if (eventName === "push") return payload.compare || payload.repository?.html_url || null;
  if (payload.pull_request?.html_url) return payload.pull_request.html_url;
  if (payload.review?.html_url) return payload.review.html_url;
  return payload.repository?.html_url || null;
}

function getOccurredAt(eventName, payload) {
  if (eventName === "push" && payload.head_commit?.timestamp) return payload.head_commit.timestamp;
  if (payload.pull_request?.updated_at) return payload.pull_request.updated_at;
  if (payload.review?.submitted_at) return payload.review.submitted_at;
  if (payload.repository?.pushed_at) return payload.repository.pushed_at;
  return new Date().toISOString();
}

class GitHubEvents {
  async record(eventName, payload, deliveryId = null) {
    const installationId = payload.installation?.id;
    if (!installationId) return [];

    const integrations = await this.findIntegrations(installationId);
    if (integrations.length === 0) return [];

    for (const integration of integrations) {
      await this.recordForIntegration(integration, eventName, payload, deliveryId);
    }

    return integrations;
  }

  async findIntegrations(installationId) {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("service_name", "github")
      .contains("credentials", { installation_id: installationId });
    if (error) throw error;
    return data || [];
  }

  async recordForIntegration(integration, eventName, payload, deliveryId) {
    if (deliveryId) {
      const { data: existing } = await supabase
        .from("github_events")
        .select("id")
        .eq("integration_id", integration.id)
        .eq("delivery_id", deliveryId)
        .maybeSingle();
      if (existing) return existing;
    }

    const repoId = payload.repository?.id || null;
    const repository = repoId ? await this.findRepository(integration.id, repoId) : null;
    const memberId = await this.resolveSenderMember(integration, payload.sender);

    const { data, error } = await supabase
      .from("github_events")
      .insert({
        user_id: integration.user_id,
        integration_id: integration.id,
        repository_id: repository?.id || null,
        repo_id: repoId,
        repo_full_name: payload.repository?.full_name || null,
        event_type: eventName,
        action: payload.action || null,
        delivery_id: deliveryId,
        sender_login: payload.sender?.login || null,
        sender_external_id: payload.sender?.id ? payload.sender.id.toString() : null,
        member_id: memberId,
        title: getEventTitle(eventName, payload),
        url: getEventUrl(eventName, payload),
        ref: payload.ref || payload.pull_request?.head?.ref || null,
        occurred_at: getOccurredAt(eventName, payload),
        payload,
      })
      .select("id")
      .single();

    if (error) {
      logger.error(`Failed to record GitHub event ${eventName}: ${error.message}`);
      throw error;
    }
    return data;
  }

  async findRepository(integrationId, repoId) {
    const { data, error } = await supabase
      .from("github_repositories")
      .select("id")
      .eq("integration_id", integrationId)
      .eq("repo_id", repoId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async resolveSenderMember(integration, sender) {
    if (!sender?.id) return null;
    const externalId = sender.id.toString();

    const { data: existingProfile, error: profileError } = await supabase
      .from("integration_members")
      .select("member_id")
      .eq("integration_id", integration.id)
      .eq("external_id", externalId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (existingProfile?.member_id) return existingProfile.member_id;

    const login = sender.login || externalId;
    let memberId = null;
    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", integration.user_id)
      .eq("alias", login)
      .maybeSingle();

    if (existingMember) {
      memberId = existingMember.id;
    } else {
      const { data: newMember, error: memberError } = await supabase
        .from("members")
        .insert({
          user_id: integration.user_id,
          full_name: login,
          alias: login,
          avatar_url: sender.avatar_url || null,
        })
        .select("id")
        .single();
      if (memberError) throw memberError;
      memberId = newMember.id;
    }

    const { error: upsertError } = await supabase
      .from("integration_members")
      .upsert({
        integration_id: integration.id,
        user_id: integration.user_id,
        member_id: memberId,
        external_id: externalId,
        username: login,
        display_name: login,
        avatar_url: sender.avatar_url || null,
        metadata: {
          github_id: sender.id,
          html_url: sender.html_url,
        },
        last_seen_at: new Date().toISOString(),
      }, { onConflict: "integration_id,external_id" });
    if (upsertError) throw upsertError;

    return memberId;
  }
}

module.exports = new GitHubEvents();
