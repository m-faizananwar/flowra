import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
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

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: member } = await adminClient
    .from('members')
    .select('id, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    avatar_url: member?.avatar_url || null,
    member_id: member?.id || null,
  });
}

export async function POST(request) {
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

  const formData = await request.formData();
  const file = formData.get('avatar');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${user.id}/profile.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error: uploadError } = await adminClient.storage
    .from('avatars')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl: rawPublicUrl } } = adminClient.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const publicUrl = `${rawPublicUrl}?v=${Date.now()}`;

  const { data: existing } = await adminClient
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1);

  const existingMember = existing?.[0];

  if (existingMember) {
    await adminClient
      .from('members')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', existingMember.id);
  } else {
    await adminClient
      .from('members')
      .insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: publicUrl,
      });
  }

  return NextResponse.json({ avatar_url: publicUrl });
}

export async function DELETE(request) {
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

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: files } = await adminClient.storage
    .from('avatars')
    .list(user.id);

  if (files && files.length > 0) {
    const paths = files.map(f => `${user.id}/${f.name}`);
    await adminClient.storage.from('avatars').remove(paths);
  }

  await adminClient
    .from('members')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
