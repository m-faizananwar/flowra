import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch the active sprint
    const { data: activeSprint } = await serviceClient
      .from('sprints')
      .select('*, sprint_metrics(*)')
      .eq('user_id', user.id)
      .eq('state', 'active')
      .order('last_synced_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch the last 5 closed sprints for velocity history
    const { data: pastSprints } = await serviceClient
      .from('sprints')
      .select('*, sprint_metrics(*)')
      .eq('user_id', user.id)
      .eq('state', 'closed')
      .order('complete_date', { ascending: false })
      .limit(5);

    // Fetch cached Jira issues for this user's active sprint
    // 4. Get jira_issues for this user that are strictly in the active sprint
    const { data: jiraIssues, error: issuesError } = await serviceClient
      .from('jira_issues')
      .select('*')
      .eq('user_id', user.id)
      .eq('sprint_jira_id', activeSprint?.jira_sprint_id);

    if (issuesError) throw issuesError;

    return NextResponse.json({
      activeSprint: activeSprint || null,
      pastSprints: pastSprints || [],
      jiraIssues: jiraIssues || [],
    });
  } catch (err) {
    console.error('[/api/sprints/data] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
