import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  const body = await request.json().catch(() => ({}));
  const analysisType = body.analysis_type;

  if (!['risk', 'evaluation', 'provision_metrics'].includes(analysisType)) {
    return NextResponse.json({ error: 'analysis_type must be risk, evaluation, or provision_metrics' }, { status: 400 });
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const engineUrl = process.env.FLOWRA_ENGINE_URL;
  if (!engineUrl) {
    return NextResponse.json({ error: 'FLOWRA_ENGINE_URL is not configured' }, { status: 500 });
  }

  const response = await fetch(`${engineUrl.replace(/\/$/, '')}/api/analysis/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.FLOWRA_ENGINE_API_KEY
        ? { Authorization: `Bearer ${process.env.FLOWRA_ENGINE_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      user_id: user.id,
      analysis_type: analysisType,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}
