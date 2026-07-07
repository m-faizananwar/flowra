const supabase = require("../lib/supabase");

class IdentityResolver {
  async buildIdentityMap(userId) {
    const [{ data: members, error: membersError }, { data: profiles, error: profilesError }] = await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, alias, role, avatar_url, metadata")
        .eq("user_id", userId)
        .order("full_name", { ascending: true }),
      supabase
        .from("integration_members")
        .select("id, integration_id, member_id, external_id, username, display_name, avatar_url, metadata, integrations(service_name)")
        .eq("user_id", userId),
    ]);

    if (membersError) throw membersError;
    if (profilesError) throw profilesError;

    const profilesByMember = new Map();
    for (const profile of profiles || []) {
      if (!profile.member_id) continue;
      if (!profilesByMember.has(profile.member_id)) profilesByMember.set(profile.member_id, []);
      profilesByMember.get(profile.member_id).push({
        profile_id: profile.id,
        service: profile.integrations?.service_name || "unknown",
        external_id: profile.external_id,
        username: profile.username,
        display_name: profile.display_name,
      });
    }

    const canonicalMembers = (members || []).map((member) => ({
      member_id: member.id,
      name: member.full_name || member.alias || "Unnamed member",
      alias: member.alias,
      role: member.role || "Unassigned",
      profiles: profilesByMember.get(member.id) || [],
    }));

    return {
      members: canonicalMembers,
      profile_count: (profiles || []).length,
      generated_at: new Date().toISOString(),
    };
  }
}

module.exports = new IdentityResolver();
