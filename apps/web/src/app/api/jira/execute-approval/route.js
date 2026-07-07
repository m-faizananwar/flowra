import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';

    // 1. Authenticate user via Supabase
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate engine URL
    const engineUrl = process.env.FLOWRA_ENGINE_URL;
    if (!engineUrl) {
      return NextResponse.json({ error: 'FLOWRA_ENGINE_URL is not configured' }, { status: 500 });
    }

    // 3. Parse the request body
    const body = await request.json().catch(() => ({}));
    const { issue_key, target_status, approval_id } = body;

    if (!issue_key || !target_status) {
      return NextResponse.json({ error: 'issue_key and target_status are required' }, { status: 400 });
    }

    // 4. Forward to the Flowra Engine's execution endpoint
    const response = await fetch(`${engineUrl.replace(/\/$/, '')}/api/jira/execute-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.FLOWRA_ENGINE_API_KEY
          ? { Authorization: `Bearer ${process.env.FLOWRA_ENGINE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        user_id: user.id,
        issue_key,
        target_status,
        approval_id,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (err) {
    console.error('[/api/jira/execute-approval] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
