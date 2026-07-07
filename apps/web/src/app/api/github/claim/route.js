import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncRepositoriesWithEngine({ integrationId, installationId, userId }) {
  let engineUrl = process.env.FLOWRA_ENGINE_URL;
  if (!engineUrl) {
    console.warn('FLOWRA_ENGINE_URL not set; skipping engine sync.');
    return { skipped: true };
  }
  engineUrl = engineUrl.replace('localhost', '127.0.0.1');

  const response = await fetch(`${engineUrl.replace(/\/$/, '')}/api/github/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.FLOWRA_ENGINE_API_KEY
        ? { Authorization: `Bearer ${process.env.FLOWRA_ENGINE_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({ integration_id: integrationId, installation_id: installationId, user_id: userId }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Sync failed: ${response.status}`);
  return payload;
}

export async function POST(request) {
  try {
    const { installation_id, user_id } = await request.json();

    if (!installation_id || !user_id) {
      return NextResponse.json({ error: 'installation_id and user_id are required' }, { status: 400 });
    }

    const installationIdInt = parseInt(installation_id, 10);

    // Find or create the integration record for this user
    const { data: existing } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('service_name', 'github')
      .single();

    let integration;

    if (existing) {
      const { data, error } = await supabase
        .from('integrations')
        .update({
          credentials: {
            ...existing.credentials,
            installation_id: installationIdInt,
            install_status: 'connected',
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error) throw error;
      integration = data;
    } else {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          user_id,
          service_name: 'github',
          credentials: { installation_id: installationIdInt, install_status: 'connected' },
          is_active: true,
        })
        .select('*')
        .single();

      if (error) throw error;
      integration = data;
    }

    // Trigger repo sync — don't fail the claim if sync fails, just report it
    let syncResult = null;
    let syncError = null;
    try {
      syncResult = await syncRepositoriesWithEngine({
        integrationId: integration.id,
        installationId: installationIdInt,
        userId: user_id,
      });
    } catch (err) {
      syncError = err.message;
      console.warn('Repo sync failed after claim, but integration is still linked:', err.message);
    }

    return NextResponse.json({
      ok: true,
      integration_id: integration.id,
      sync: syncResult,
      sync_error: syncError,
    });
  } catch (err) {
    console.error('GitHub claim error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
