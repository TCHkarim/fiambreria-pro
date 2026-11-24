import { createClient } from '@supabase/supabase-js';

// Obtenemos credenciales de localStorage o variables de entorno
const getSupabaseConfig = () => {
  const storedUrl = localStorage.getItem('la_artesana_supabase_url');
  const storedKey = localStorage.getItem('la_artesana_supabase_key');

  const supabaseUrl = storedUrl || import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
  const supabaseAnonKey = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

  return { supabaseUrl, supabaseAnonKey, isConfigured: Boolean(storedUrl || import.meta.env.VITE_SUPABASE_URL) };
};

export const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('la_artesana_supabase_url', url);
  localStorage.setItem('la_artesana_supabase_key', key);
  window.location.reload();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('la_artesana_supabase_url');
  localStorage.removeItem('la_artesana_supabase_key');
  window.location.reload();
};
