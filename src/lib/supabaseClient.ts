import { createBrowserClient } from '@supabase/ssr';

// Cliente de Supabase para el navegador. Se activará en cuanto NEXT_PUBLIC_SUPABASE_URL
// y NEXT_PUBLIC_SUPABASE_ANON_KEY existan (ver .env.local.example); hasta entonces
// la app sigue funcionando con los datos mock de src/lib/mockData.ts.
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
