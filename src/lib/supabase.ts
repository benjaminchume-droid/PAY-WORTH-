import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const defaultUrl = 'https://bdbgizhgjbgqwlmdanvt.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYmdpemhnamJncXdsbWRhbnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MTU2NzAsImV4cCI6MjEwMDE5MTY3MH0.eeDjOCTXYJxa77z0peGRTGvrsCsZhIFyw-is9Pu2va0';

const rawUrl = meta.env?.VITE_SUPABASE_URL || '';
const rawKey = meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Strip any accidental double-quotes or whitespace
const cleanUrl = rawUrl.replace(/["']/g, '').trim();
const cleanKey = rawKey.replace(/["']/g, '').trim();

const urlToUse = cleanUrl && cleanUrl.startsWith('http') ? cleanUrl : defaultUrl;
const keyToUse = cleanKey && cleanKey.length > 20 ? cleanKey : defaultKey;

export const isSupabaseConfigured = true;

export const supabase = createClient(urlToUse, keyToUse, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

