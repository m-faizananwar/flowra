import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Get Integration Data
    const { data: integration, error: dbError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service_name', 'jira')
      .single();

    if (dbError || !integration) {
      return NextResponse.json({ error: 'No Jira integration found' }, { status: 404 });
    }

    const { access_token, cloud_id } = integration.credentials;

    // 2. Fetch Projects from Jira
    const projectResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/project`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    if (!projectResponse.ok) {
      throw new Error(`Jira API error: ${projectResponse.statusText}`);
    }

    const projects = await projectResponse.json();

    // 3. Fetch Recent Issues (Sample)
    const issueResponse = await fetch(`https://api.atlassian.com/ex/jira/${cloud_id}/rest/api/3/search?maxResults=5`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    });

    const issueData = await issueResponse.json();

    return NextResponse.json({
      success: true,
      instance: integration.credentials.name,
      projects: projects.map((p: any) => ({ key: p.key, name: p.name })),
      issues: issueData.issues?.map((i: any) => ({
        key: i.key,
        summary: i.fields.summary,
        status: i.fields.status.name
      })) || []
    });

  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
