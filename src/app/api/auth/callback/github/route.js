import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Note: Using service role key here to ensure we can update the integration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncRepositoriesWithEngine({ integrationId, installationId, userId }) {
  let engineUrl = process.env.FLOWRA_ENGINE_URL;
  if (!engineUrl) {
    console.warn('FLOWRA_ENGINE_URL is not configured; skipping immediate GitHub repo sync.');
    return { skipped: true };
  }
  // Force IPv4 loopback for Node.js fetch compatibility
  engineUrl = engineUrl.replace('localhost', '127.0.0.1');

  const response = await fetch(`${engineUrl.replace(/\/$/, '')}/api/github/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.FLOWRA_ENGINE_API_KEY
        ? { Authorization: `Bearer ${process.env.FLOWRA_ENGINE_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      integration_id: integrationId,
      installation_id: installationId,
      user_id: userId,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `GitHub repo sync failed with ${response.status}`);
  }

  return payload;
}

export async function GET(request) {
  console.log('GitHub Callback Received!');
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const cookieStore = await cookies();
  const userId = searchParams.get('state') || cookieStore.get('flowra_github_install_user')?.value;

  console.log('Params:', { installationId, setupAction, userId });

  if (setupAction === 'request') {
    return NextResponse.redirect(new URL('/integrations?error=github_install_requires_admin_approval', request.url));
  }

  if (!installationId || !userId) {
    console.error('Missing Params:', { installationId, userId });
    return NextResponse.redirect(new URL('/integrations?error=missing_params', request.url));
  }

  try {
    // 1. Find or create the GitHub integration for this user
    const { data: existing, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service_name', 'github')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let integration = existing;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('integrations')
        .update({
          credentials: { ...existing.credentials, installation_id: parseInt(installationId) },
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error) throw error;
      integration = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          user_id: userId,
          service_name: 'github',
          credentials: { installation_id: parseInt(installationId) },
          is_active: true
        })
        .select('*')
        .single();

      if (error) throw error;
      integration = data;
    }

    // 2. Trigger repo sync — don't fail the whole callback if engine is temporarily down.
    try {
      await syncRepositoriesWithEngine({
        integrationId: integration.id,
        installationId: parseInt(installationId),
        userId,
      });
    } catch (syncError) {
      // Log the error but don't disable the integration — the installation_id is saved.
      // Repos will sync the next time the webhook fires or user hits "Re-Sync".
      console.warn('GitHub repo sync failed after callback, integration remains active:', syncError.message);
    }

    // 3. Redirect back to integrations with success
    const response = NextResponse.redirect(new URL('/integrations?github=success', request.url));
    response.cookies.delete('flowra_github_install_user');
    return response;
  } catch (err) {
    console.error('GitHub Callback Error:', err);
    return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
