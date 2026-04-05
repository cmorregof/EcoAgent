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

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-slate-400 hover:text-green-400 transition-colors"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold gradient-text">Configuración</h1>
      </div>

      <div className="glass-card p-8 space-y-6">
        {/* Alert Threshold */}
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-slate-300 mb-2">
            Umbral de Alerta
          </label>
          <select
            id="threshold"
            value={settings.alert_threshold}
            onChange={(e) => setSettings({ ...settings, alert_threshold: e.target.value })}
            className="w-full"
          >
            <option value="LOW">🟢 LOW — Notificar siempre</option>
            <option value="MEDIUM">🟡 MEDIUM — Riesgo moderado o superior</option>
            <option value="HIGH">🟠 HIGH — Solo riesgo alto o crítico</option>
            <option value="CRITICAL">🔴 CRITICAL — Solo emergencias</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Solo recibirás alertas cuando el nivel de riesgo iguale o supere este umbral.
          </p>
        </div>

        {/* Voice */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Alertas por voz</p>
            <p className="text-xs text-slate-500">Recibir notas de voz en Telegram cuando el riesgo es alto</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, voice_enabled: !settings.voice_enabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.voice_enabled ? 'bg-green-500' : 'bg-slate-700'
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
          <label htmlFor="frequency" className="block text-sm font-medium text-slate-300 mb-2">
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
          <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">
            Idioma
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
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-slate-700/50">
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
          {saved && (
            <p className="text-green-400 text-sm text-center mt-2">
              Los cambios se sincronizarán automáticamente con tu bot de Telegram.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
