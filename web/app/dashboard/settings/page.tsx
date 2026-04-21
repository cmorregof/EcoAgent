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

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 100);
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
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-obsidian-on-surface-var animate-pulse font-mono text-sm tracking-widest">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <>
      <div className="section-header reveal">
        <div className="section-tag">{t('settings.system_header')}</div>
        <div className="section-line"></div>
      </div>

      <div className="panel reveal max-w-2xl">
        <div className="panel-header">
          <div className="panel-title">{t('settings.user_preferences')}</div>
          <div className="panel-tag">USER_SETTINGS_TABLE</div>
        </div>
        
        <div className="panel-body p-6 space-y-8">
          {/* Alert Threshold */}
          <div>
            <label htmlFor="threshold" className="block text-xs font-mono text-obsidian-on-surface-var mb-2">
              {t('settings.threshold_label_telegram')}
            </label>
            <select
              id="threshold"
              value={settings.alert_threshold}
              onChange={(e) => setSettings({ ...settings, alert_threshold: e.target.value })}
              className="w-full bg-obsidian-surface-mid border-obsidian-outline-var text-obsidian-on-surface"
            >
              <option value="LOW">🟢 {t('dashboard.low').toUpperCase()}</option>
              <option value="MEDIUM">🟡 {t('dashboard.medium').toUpperCase()}</option>
              <option value="HIGH">🟠 {t('dashboard.high').toUpperCase()}</option>
              <option value="CRITICAL">🔴 {t('dashboard.critical').toUpperCase()}</option>
            </select>
            <p className="text-xs text-obsidian-on-surface-var/60 mt-2 font-mono">
              {t('settings.threshold_desc')}
            </p>
          </div>

          {/* Voice */}
          <div className="flex items-center justify-between border-t border-obsidian-outline-var pt-6">
            <div>
              <p className="text-xs font-mono text-obsidian-on-surface-var mb-1">{t('settings.voice_header')}</p>
              <p className="text-xs text-obsidian-on-surface-var/60 font-mono">{t('settings.voice_desc_short')}</p>
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
          <div className="border-t border-obsidian-outline-var pt-6">
            <label htmlFor="frequency" className="block text-xs font-mono text-obsidian-on-surface-var mb-2">
              {t('settings.frequency_label')}
            </label>
            <select
              id="frequency"
              value={settings.report_frequency_hours}
              onChange={(e) =>
                setSettings({ ...settings, report_frequency_hours: parseInt(e.target.value, 10) })
              }
              className="w-full bg-obsidian-surface-mid border-obsidian-outline-var text-obsidian-on-surface"
            >
              <option value={1}>{t('settings.freq_1h')}</option>
              <option value={3}>{t('settings.freq_3h')}</option>
              <option value={6}>{t('settings.freq_6h')}</option>
              <option value={12}>{t('settings.freq_12h')}</option>
              <option value={24}>{t('settings.freq_24h')}</option>
            </select>
          </div>

          {/* Language */}
          <div className="border-t border-obsidian-outline-var pt-6">
            <label htmlFor="language" className="block text-xs font-mono text-obsidian-on-surface-var mb-2">
              [ {t('settings.language_label').toUpperCase()} ]
            </label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-obsidian-surface-mid border-obsidian-outline-var text-obsidian-on-surface"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>

          <div className="pt-8 mt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm tracking-widest uppercase">
              {saving ? t('common.saving') : saved ? t('settings.save_success') : t('settings.applying_changes')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
