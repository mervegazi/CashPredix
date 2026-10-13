import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback to project defaults
const DEFAULT_SUPABASE_URL = 'https://fvppactxgsfqhwariqxh.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GqzCnBKj8XgiGPXo3tclfw_E7da1sC6';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create client safely without throwing top-level fatal crashes
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
