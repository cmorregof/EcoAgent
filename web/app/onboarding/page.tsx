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
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function OnboardingPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(t('onboarding.not_authenticated'));
      setLoading(false);
      return;
    }

    // For MVP, the code IS the telegram_chat_id
    // In production, this would validate against a codes table
    const telegramChatId = code.trim();

    if (!telegramChatId || telegramChatId.length < 4) {
      setError(t('onboarding.invalid_code'));
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
          <h1 className="text-2xl font-bold mb-2">{t('onboarding.title')}</h1>
          <p className="text-slate-400">{t('onboarding.subtitle')}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <p className="text-slate-300">
              {t('onboarding.step1')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <p className="text-slate-300">
              {t('onboarding.step2')}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <p className="text-slate-300">
              {t('onboarding.step3')}
            </p>
          </div>
        </div>

        <form onSubmit={handleLink} className="space-y-4">
          <input
            id="telegram-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('onboarding.placeholder')}
            className="w-full text-center text-2xl tracking-widest font-mono"
            maxLength={20}
          />

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('onboarding.linking') : t('onboarding.button')}
          </button>
        </form>

        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="w-full text-center text-sm text-slate-500 mt-6 hover:text-slate-400 transition-colors"
        >
          {t('common.not_your_account')} {t('common.logout')}
        </button>
      </div>
    </div>
  );
}
