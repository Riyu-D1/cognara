-- ============================================
-- SUPABASE STORAGE SETUP FOR PROFILE PICTURES
-- ============================================
-- This script creates the storage bucket and policies for user profile pictures
-- Run this in your Supabase SQL Editor

-- Step 1: Create the storage bucket (if not exists)
-- Note: Storage buckets are created via the Supabase Dashboard, not SQL
-- Go to: Storage > Create a new bucket > Name: "user-content" > Public: YES

-- Step 2: Create storage policies for the bucket
-- These policies allow users to upload, view, update, and delete their own profile pictures

-- Policy 1: Allow authenticated users to upload files
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
SELECT 
  'user-content',
  'avatars/' || auth.uid() || '/' || gen_random_uuid() || '.jpg',
  auth.uid(),
  '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'user-content'
);

-- Policy 2: Allow anyone to view/download files (public read)
CREATE POLICY "Public Access for user-content bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-content');

-- Policy 3: Allow authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload to user-content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Policy 4: Allow users to update their own files
CREATE POLICY "Users can update their own files in user-content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-content' 
  AND auth.uid()::text = owner
);

-- Policy 5: Allow users to delete their own files
CREATE POLICY "Users can delete their own files from user-content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-content' 
  AND auth.uid()::text = owner
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your setup:

-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'user-content';

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test upload (replace with your user ID):
-- SELECT storage.foldername('avatars/test.jpg');
