// ---
// 📚 POR QUÉ: Cliente Supabase para el browser (CSR). Usa la anon key que tiene
//    permisos limitados por RLS. Sin separar browser/server client, se arriesga
//    exponer la service_role key (acceso total) en el frontend.
// 📁 ARCHIVO: web/lib/supabase/client.ts
// ---

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
