-- ============================================================================
-- Migration: 20260818062056_phase_a_performance_tuning.sql
-- Production Project: vuanhmedia-production (rjylcqtiicmhhhpuxuyw)
-- ============================================================================

-- 1. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects(is_featured);

CREATE INDEX IF NOT EXISTS idx_project_videos_project_id ON public.project_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_videos_status ON public.project_videos(status);
CREATE INDEX IF NOT EXISTS idx_project_videos_sort_order ON public.project_videos(sort_order);

CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON public.project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_status ON public.project_media(status);
CREATE INDEX IF NOT EXISTS idx_project_media_sort_order ON public.project_media(sort_order);

CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON public.site_content(content_key);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 2. Realtime Publication Configuration
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_videos;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_media;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
