// ---
// 📚 POR QUÉ: Página de settings donde el usuario ajusta sus preferencias.
//    Los cambios se reflejan automáticamente en el bot de Telegram porque ambos
//    leen de Supabase. Sin esta página, el usuario tendría que usar comandos de
//    Telegram para cambiar cada setting — mala UX para configuración compleja.
// 📁 ARCHIVO: web/app/dashboard/settings/page.tsx
// ---

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/i18n/translations';

interface Settings {
  alert_threshold: string;
  voice_enabled: boolean;
  report_frequency_hours: number;
  language: string;
  location_name: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_settings')
      .update({
        alert_threshold: settings.alert_threshold,
        voice_enabled: settings.voice_enabled,
        report_frequency_hours: settings.report_frequency_hours,
        language: settings.language,
      })
      .eq('user_id', user.id);

    setLanguage(settings.language as Language);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-obsidian-on-surface-var animate-pulse font-body">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-obsidian-on-surface-var hover:text-obsidian-accent transition-colors font-medium flex items-center gap-2"
        >
          ← {t('settings.back')}
        </button>
        <h1 className="text-3xl font-bold gradient-text pb-1">{t('settings.title')}</h1>
      </div>

      <div className="glass-card p-8 space-y-6">
        {/* Alert Threshold */}
        <div>
          <label htmlFor="threshold" className="block text-sm font-bold text-obsidian-on-surface-var uppercase tracking-wider mb-3">
            {t('settings.threshold_label')}
          </label>
          <select
            id="threshold"
            value={settings.alert_threshold}
            onChange={(e) => setSettings({ ...settings, alert_threshold: e.target.value })}
            className="w-full"
          >
            <option value="LOW">🟢 LOW</option>
            <option value="MEDIUM">🟡 MEDIUM</option>
            <option value="HIGH">🟠 HIGH</option>
            <option value="CRITICAL">🔴 CRITICAL</option>
          </select>
          <p className="text-xs text-obsidian-on-surface-var/60 mt-2 font-body">
            {t('settings.threshold_desc')}
          </p>
        </div>

        {/* Voice */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-obsidian-on-surface-var uppercase tracking-wider">{t('settings.voice_label')}</p>
            <p className="text-xs text-obsidian-on-surface-var/60 mt-1 font-body">{t('settings.voice_desc')}</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, voice_enabled: !settings.voice_enabled })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              settings.voice_enabled ? 'bg-obsidian-accent' : 'bg-obsidian-surface-bright'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.voice_enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Report Frequency */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-bold text-obsidian-on-surface-var uppercase tracking-wider mb-3">
            Frecuencia de reportes automáticos
          </label>
          <select
            id="frequency"
            value={settings.report_frequency_hours}
            onChange={(e) =>
              setSettings({ ...settings, report_frequency_hours: parseInt(e.target.value, 10) })
            }
            className="w-full"
          >
            <option value={1}>Cada 1 hora</option>
            <option value={3}>Cada 3 horas</option>
            <option value={6}>Cada 6 horas</option>
            <option value={12}>Cada 12 horas</option>
            <option value={24}>Cada 24 horas</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-bold text-obsidian-on-surface-var uppercase tracking-wider mb-3">
            {t('settings.language_label')}
          </label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full"
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇺🇸 English</option>
          </select>
          <p className="text-xs text-obsidian-on-surface-var/60 mt-2 font-body">
            {t('settings.language_desc')}
          </p>
        </div>

        <div className="pt-6 border-t border-obsidian-outline-var/50">
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 text-base tracking-wide">
            {saving ? t('common.saving') : saved ? `✓ ${t('settings.success')}` : t('common.save')}
          </button>
          {saved && (
            <p className="text-risk-low text-sm text-center mt-3 font-medium animate-bounce">
              {t('settings.success')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
