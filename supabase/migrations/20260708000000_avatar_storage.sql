-- Avatar Storage Bucket
-- Enables user-uploaded profile pictures via Supabase Storage

-- 1. Create the avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    storage.foldername(name)[1] = auth.uid()::text
);

-- 3. Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    storage.foldername(name)[1] = auth.uid()::text
);

-- 4. Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    storage.foldername(name)[1] = auth.uid()::text
);

-- 5. Public read access (avatars are public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 6. Add upsert policy for the members table if not exists
CREATE POLICY "Users can insert their own member record"
ON public.members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
