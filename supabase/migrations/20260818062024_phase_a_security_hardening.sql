-- ============================================================================
-- Migration: 20260818062024_phase_a_security_hardening.sql
-- Production Project: vuanhmedia-production (rjylcqtiicmhhhpuxuyw)
-- ============================================================================

-- 1. Private / Internal Schema for Admin Helper (Not exposed to Public PostgREST)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
  );
END;
$$;

-- 2. Updated_at Auto-trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_project_videos_updated_at BEFORE UPDATE ON public.project_videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_project_media_updated_at BEFORE UPDATE ON public.project_media FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Enable RLS on all 6 tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Admin users can view admin list"
ON public.admin_users FOR SELECT
TO authenticated
USING (private.is_admin());

CREATE POLICY "Public read published projects"
ON public.projects FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Admin full access projects"
ON public.projects FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

CREATE POLICY "Public read published project videos"
ON public.project_videos FOR SELECT
TO anon, authenticated
USING (
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.status = 'published'
  )
);

CREATE POLICY "Admin full access project videos"
ON public.project_videos FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

CREATE POLICY "Public read published project media"
ON public.project_media FOR SELECT
TO anon, authenticated
USING (
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.status = 'published'
  )
);

CREATE POLICY "Admin full access project media"
ON public.project_media FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

CREATE POLICY "Public read published site content"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admin full access site content"
ON public.site_content FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- Immutable Activity Logs (SELECT only, NO INSERT/UPDATE/DELETE for clients)
CREATE POLICY "Admin view activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (private.is_admin());

-- 5. Storage RLS
CREATE POLICY "Public Read Objects in Assets Bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'vuanhmedia-assets');

CREATE POLICY "Admin Upload Objects in Assets Bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vuanhmedia-assets' AND
  private.is_admin()
);

CREATE POLICY "Admin Update Objects in Assets Bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vuanhmedia-assets' AND private.is_admin())
WITH CHECK (bucket_id = 'vuanhmedia-assets' AND private.is_admin());

CREATE POLICY "Admin Delete Objects in Assets Bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vuanhmedia-assets' AND private.is_admin());
