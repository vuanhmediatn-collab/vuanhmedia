-- ============================================================================
-- Migration: 20260818062904_phase_a_site_content_realtime.sql
-- Production Project: vuanhmedia-production (rjylcqtiicmhhhpuxuyw)
-- ============================================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
