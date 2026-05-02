import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'flowra-ai';

  if (!userId) {
    return NextResponse.redirect(new URL('/integrations?error=missing_user', request.url));
  }

  const installStartedAt = new Date().toISOString();
  const { error } = await supabase
    .from('integrations')
    .upsert(
      {
        user_id: userId,
        service_name: 'github',
        credentials: {
          install_session_started_at: installStartedAt,
          install_status: 'pending',
        },
        is_active: false,
        updated_at: installStartedAt,
      },
      { onConflict: 'user_id,service_name' }
    );

  if (error) {
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  const githubUrl = new URL(`https://github.com/apps/${appName}/installations/new`);
  githubUrl.searchParams.set('state', userId);

  const response = NextResponse.redirect(githubUrl);
  response.cookies.set('flowra_github_install_user', userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60,
    path: '/',
  });

  return response;
}
