// ---
// 📚 POR QUÉ: Cliente Supabase para Server Components y Route Handlers.
//    Usa cookies para mantener la sesión del usuario en SSR.
//    Sin esto, cada request SSR sería anónimo y no podría leer datos del usuario.
// 📁 ARCHIVO: web/lib/supabase/server.ts
// ---

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components we can't set cookies — this is expected
          }
        },
      },
    }
  );
}
