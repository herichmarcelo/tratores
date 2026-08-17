import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || ''
).trim();

if (!supabaseUrl || !supabaseKey || supabaseKey === 'placeholder') {
  console.error(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (chave publishable) no .env.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: async (input, init) => {
      try {
        return await fetch(input, init);
      } catch {
        throw new Error(
          `Não foi possível conectar ao Supabase (${supabaseUrl || 'URL vazia'}). Confira VITE_SUPABASE_URL em Settings → API.`,
        );
      }
    },
  },
});