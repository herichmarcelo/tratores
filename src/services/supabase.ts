import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || ''
).trim();

if (!supabaseUrl || !supabaseKey || supabaseKey === 'placeholder') {
  console.error(
    'Supabase não configurado. Defina VITE_SUPABASE_ANON_KEY com sua chave publishable (sb_publishable_...) no .env e na Vercel.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);