export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = 'draft' | 'published' | 'hidden' | 'archived';
export type VideoProvider = 'youtube' | 'vimeo' | 'drive' | 'direct';
export type MediaType = 'image' | 'video' | 'document' | 'audio';
export type AdminRole = 'super_admin' | 'admin' | 'editor';
export type ContentType = 'text' | 'array' | 'object';

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          role: AdminRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          role?: AdminRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          role?: AdminRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          client: string | null;
          category: string;
          year: string | null;
          short_description: string | null;
          full_description: string | null;
          scope_of_work: string | null;
          role_played: string | null;
          cover_image: string | null;
          thumbnail: string | null;
          sort_order: number;
          is_featured: boolean;
          status: ProjectStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          client?: string | null;
          category?: string;
          year?: string | null;
          short_description?: string | null;
          full_description?: string | null;
          scope_of_work?: string | null;
          role_played?: string | null;
          cover_image?: string | null;
          thumbnail?: string | null;
          sort_order?: number;
          is_featured?: boolean;
          status?: ProjectStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          client?: string | null;
          category?: string;
          year?: string | null;
          short_description?: string | null;
          full_description?: string | null;
          scope_of_work?: string | null;
          role_played?: string | null;
          cover_image?: string | null;
          thumbnail?: string | null;
          sort_order?: number;
          is_featured?: boolean;
          status?: ProjectStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_videos: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          video_url: string;
          provider: VideoProvider;
          thumbnail: string | null;
          description: string | null;
          sort_order: number;
          status: 'published' | 'hidden';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          video_url: string;
          provider?: VideoProvider;
          thumbnail?: string | null;
          description?: string | null;
          sort_order?: number;
          status?: 'published' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          video_url?: string;
          provider?: VideoProvider;
          thumbnail?: string | null;
          description?: string | null;
          sort_order?: number;
          status?: 'published' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          media_type: MediaType;
          file_url: string;
          caption: string | null;
          sort_order: number;
          status: 'published' | 'hidden';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          media_type?: MediaType;
          file_url: string;
          caption?: string | null;
          sort_order?: number;
          status?: 'published' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          media_type?: MediaType;
          file_url?: string;
          caption?: string | null;
          sort_order?: number;
          status?: 'published' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
      };
      site_content: {
        Row: {
          id: string;
          section: string;
          content_key: string;
          draft_value: Json;
          published_value: Json;
          content_type: ContentType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section: string;
          content_key: string;
          draft_value: Json;
          published_value: Json;
          content_type?: ContentType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section?: string;
          content_key?: string;
          draft_value?: Json;
          published_value?: Json;
          content_type?: ContentType;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          entity_title: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          entity_title?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never; // Immutable
      };
    };
    Views: {
      public_site_content: {
        Row: {
          id: string;
          section: string;
          content_key: string;
          published_value: Json;
          content_type: ContentType;
          updated_at: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      bootstrap_admin_user: {
        Args: { target_email: string };
        Returns: Json;
      };
    };
  };
}
