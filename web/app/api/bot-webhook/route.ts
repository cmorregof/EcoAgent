// ---
// 📚 POR QUÉ: API route que recibe reportes del bot y los guarda en Supabase.
//    Esto cierra el circuito bot→web: cuando el bot genera un análisis via Telegram,
//    lo envía aquí para que aparezca en el dashboard del usuario en tiempo real.
//    Usa la service_role key porque el bot actúa como servicio, no como usuario.
// 📁 ARCHIVO: web/app/api/bot-webhook/route.ts
// ---

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Service role client — full access, bypasses RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface WebhookPayload {
  telegram_chat_id: string;
  alert_level: string;
  risk_probability: number;
  mean_saturation: number;
  precipitation_mm: number;
  temperature_c: number;
  humidity_pct: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as WebhookPayload;

    const supabase = getServiceClient();

    // Find user by telegram_chat_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_chat_id', body.telegram_chat_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found for this telegram_chat_id' },
        { status: 404 }
      );
    }

    // Insert risk report
    const { error: insertError } = await supabase.from('risk_reports').insert({
      user_id: user.id,
      alert_level: body.alert_level,
      risk_probability: body.risk_probability,
      mean_saturation: body.mean_saturation,
      precipitation_mm: body.precipitation_mm,
      temperature_c: body.temperature_c,
      humidity_pct: body.humidity_pct,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
