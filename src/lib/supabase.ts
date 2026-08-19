import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.error(
    '❌ Supabase Configuration Error: Both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be defined in your environment.'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://rjylcqtiicmhhhpuxuyw.supabase.co',
  supabasePublishableKey || 'unconfigured-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
