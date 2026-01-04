-- ============================================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- Run this in Supabase SQL Editor OR create manually in Storage UI
-- ============================================================================

-- NOTE: Supabase Storage buckets are usually created via UI at:
-- https://supabase.com/dashboard/project/oystfhlzrbomutzdukix/storage/buckets

-- But here's the SQL if you want to do it programmatically:

-- ============================================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================================

-- Avatars bucket (5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Media bucket (100MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  104857600, -- 100MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- NFTs bucket (50MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nfts',
  'nfts',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mpeg', 'model/gltf+json', 'model/gltf-binary']
)
ON CONFLICT (id) DO NOTHING;

-- Book files bucket (100MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-files',
  'book-files',
  true,
  104857600, -- 100MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. STORAGE POLICIES
-- ============================================================================

-- Avatars: Anyone can view, authenticated users can upload their own
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Media: Anyone can view, authenticated users can upload
CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Users can update own media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- NFTs: Anyone can view, authenticated users can upload
CREATE POLICY "Anyone can view NFTs" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'nfts');

CREATE POLICY "Authenticated users can upload NFTs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'nfts');

CREATE POLICY "Users can update own NFTs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'nfts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Book files: Anyone can view, authenticated users can upload
CREATE POLICY "Anyone can view book files" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'book-files');

CREATE POLICY "Authenticated users can upload books" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-files');

CREATE POLICY "Users can update own books" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'book-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own books" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'book-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- STORAGE SETUP COMPLETE
-- ============================================================================
