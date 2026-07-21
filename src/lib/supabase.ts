import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errMsg = 'CRITICAL CONFIGURATION ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing! The application cannot run without Supabase configured. Please set these in your env parameters.';
  console.error(errMsg);
  // Fail immediately on startup to prevent continuing with mock/fallback state
  throw new Error(errMsg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
