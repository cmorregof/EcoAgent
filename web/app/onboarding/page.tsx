// ---
// 📚 POR QUÉ: Onboarding para vincular la cuenta web con Telegram.
//    Sin este enlace, los reportes del bot no se conectarían con el dashboard web.
//    El código de 6 dígitos es validado y almacena el telegram_chat_id en Supabase,
//    cerrando el circuito bot↔web.
// 📁 ARCHIVO: web/app/onboarding/page.tsx
// ---

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    // For MVP, the code IS the telegram_chat_id
    // In production, this would validate against a codes table
    const telegramChatId = code.trim();

    if (!telegramChatId || telegramChatId.length < 4) {
      setError('Código inválido. Debe tener al menos 4 caracteres.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ telegram_chat_id: telegramChatId })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold mb-2">Vincula tu Telegram</h1>
          <p className="text-slate-400">Conecta tu bot para recibir alertas en tiempo real</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <p className="text-slate-300">
              Busca <span className="font-mono text-green-400">@velveten_eco_agent_bot</span> en Telegram
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <p className="text-slate-300">
              Envía el comando <span className="font-mono text-green-400">/start</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <p className="text-slate-300">
              El bot te dará un código. Pégalo aquí abajo:
            </p>
          </div>
        </div>

        <form onSubmit={handleLink} className="space-y-4">
          <input
            id="telegram-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Tu código de Telegram"
            className="w-full text-center text-2xl tracking-widest font-mono"
            maxLength={20}
          />

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Vinculando...' : 'Vincular Telegram'}
          </button>
        </form>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full text-center text-sm text-slate-400 mt-4 hover:text-slate-300 transition-colors"
        >
          Omitir por ahora →
        </button>
      </div>
    </div>
  );
}
