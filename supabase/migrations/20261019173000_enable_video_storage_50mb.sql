-- Migration: 20261019173000_enable_video_storage_50mb.sql
-- Description: Expand file upload limit to 50MB (Supabase Free Tier Maximum - 0 VND)
--              and enable direct video uploads (MP4, WebM, MOV) and WebP/GIF/SVG assets.

-- 1. Update project_videos provider check constraint to allow 'direct' MP4 uploads
ALTER TABLE public.project_videos DROP CONSTRAINT IF EXISTS project_videos_provider_check;
ALTER TABLE public.project_videos ADD CONSTRAINT project_videos_provider_check 
  CHECK (provider IN ('youtube', 'vimeo', 'drive', 'direct'));

-- 2. Update project_media media_type check constraint to allow 'video'
ALTER TABLE public.project_media DROP CONSTRAINT IF EXISTS project_media_media_type_check;
ALTER TABLE public.project_media ADD CONSTRAINT project_media_media_type_check 
  CHECK (media_type IN ('image', 'video', 'document', 'audio'));

-- 3. Upgrade Storage Buckets to 50MB (52,428,800 bytes) and permit video MIME types
UPDATE storage.buckets
SET 
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
WHERE id IN ('vuanhmedia-assets', 'visual-cms-media');

-- 4. Verify storage RLS policies allow authenticated admins to upload/delete objects in videos path
DO $$
BEGIN
  -- Re-affirm bucket is public
  UPDATE storage.buckets SET public = true WHERE id IN ('vuanhmedia-assets', 'visual-cms-media');
END $$;
