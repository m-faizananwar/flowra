import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key for server-side database updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId passed from frontend

  if (!code || !state) {
    return NextResponse.redirect(new URL('/integrations?error=missing_params', request.url));
  }

  try {
    // 1. Exchange Code for Access/Refresh Tokens
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.JIRA_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Token exchange failed');
    }

    // 2. Get Accessible Resources (Cloud ID)
    const resourceResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    const resources = await resourceResponse.json();
    
    if (!resources || resources.length === 0) {
      throw new Error('No Jira resources found for this account');
    }

    // Use the first resource by default
    const site = resources[0];

    // 3. Store in Supabase
    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        user_id: state,
        service_name: 'jira',
        credentials: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          cloud_id: site.id,
          url: site.url,
          name: site.name,
          scopes: tokenData.scope,
          updated_at: new Date().toISOString()
        },
        is_active: true
      }, { onConflict: 'user_id,service_name' });

    if (dbError) throw dbError;

    // 4. Redirect back to Integrations Page
    return NextResponse.redirect(new URL('/integrations?success=jira', request.url));

  } catch (error: any) {
    console.error('Jira OAuth Error:', error);
    return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(error.message)}`, request.url));
  }
}
