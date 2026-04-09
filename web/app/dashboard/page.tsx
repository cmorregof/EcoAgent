// ---
// 📚 POR QUÉ: Dashboard principal con 4 secciones de visualización de riesgo climático.
//    Es la interfaz web core del SaaS — da visibilidad que el bot de Telegram no puede
//    (gráficas, mapas, historial tabular). Sin este dashboard, el usuario solo tendría
//    snapshots textuales del bot sin contexto histórico ni geoespacial.
// 📁 ARCHIVO: web/app/dashboard/page.tsx
// ---

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import dynamic from 'next/dynamic';

// Lazy-load chart and map to avoid SSR issues
const RiskChart = dynamic(() => import('./components/RiskChart'), { ssr: false });
const RiskMap = dynamic(() => import('./components/RiskMap'), { ssr: false });

interface RiskReport {
  id: string;
  alert_level: string;
  risk_probability: number;
  mean_saturation: number;
  precipitation_mm: number;
  temperature_c: number;
  humidity_pct: number;
  created_at: string;
}

interface UserSettings {
  alert_threshold: string;
  location_lat: number;
  location_lon: number;
  location_name: string;
}

const ALERT_CONFIG: Record<string, { emoji: string; color: string; glow: string; bg: string }> = {
  LOW: { emoji: '🟢', color: 'text-risk-low', glow: 'glow-low', bg: 'bg-risk-low/10' },
  MEDIUM: { emoji: '🟡', color: 'text-risk-medium', glow: 'glow-medium', bg: 'bg-risk-medium/10' },
  HIGH: { emoji: '🟠', color: 'text-risk-high', glow: 'glow-high', bg: 'bg-risk-high/10' },
  CRITICAL: { emoji: '🔴', color: 'text-risk-critical', glow: 'glow-critical', bg: 'bg-risk-critical/10' },
};

export default function DashboardPage() {
  const [reports, setReports] = useState<RiskReport[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [reportsRes, settingsRes, userRes] = await Promise.all([
      supabase
        .from('risk_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(24),
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('users')
        .select('telegram_chat_id')
        .eq('id', user.id)
        .single(),
    ]);

    if (!userRes.data?.telegram_chat_id) {
      router.push('/onboarding');
      return;
    }

    if (reportsRes.data) setReports(reportsRes.data);
    if (settingsRes.data) setSettings(settingsRes.data);
    setLoading(false);
  };

  const latestReport = reports[0];
  const alertStyle = latestReport ? ALERT_CONFIG[latestReport.alert_level] ?? ALERT_CONFIG.LOW : ALERT_CONFIG.LOW;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-obsidian-on-surface-var text-sm font-body mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-obsidian-accent animate-pulse" />
            {settings?.location_name ?? 'Manizales, Colombia'}
          </p>
        </div>
        <a
          href="/dashboard/settings"
          className="text-obsidian-on-surface-var hover:text-obsidian-accent transition-all duration-300 font-medium flex items-center gap-2 bg-obsidian-surface-mid px-4 py-2 rounded-lg border border-obsidian-outline-var"
        >
          ⚙️ {t('dashboard.settings')}
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`glass-card p-8 ${alertStyle.glow}`}>
          <h2 className="text-xs font-bold text-obsidian-on-surface-var uppercase tracking-[0.2em] mb-6">
            {t('dashboard.current_risk')}
          </h2>
          {latestReport ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{alertStyle.emoji}</span>
                <div>
                  <p className={`text-4xl font-extrabold ${alertStyle.color}`}>
                    {latestReport.alert_level}
                  </p>
                  <p className="text-obsidian-on-surface-var text-sm mt-1">
                    {t('dashboard.probability')}: <span className="text-obsidian-on-surface font-mono">{(latestReport.risk_probability * 100).toFixed(1)}%</span>
                  </p>
                </div>
              </div>
              <p className="text-obsidian-on-surface-var/50 text-xs font-mono">
                {t('dashboard.last_calc')}: {new Date(latestReport.created_at).toLocaleString(language === 'es' ? 'es-CO' : 'en-US')}
              </p>
            </>
          ) : (
            <p className="text-obsidian-on-surface-var">
              {t('dashboard.no_reports')}
            </p>
          )}
        </div>

        {/* Section 2 — CIR Chart */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-bold text-obsidian-on-surface-var uppercase tracking-[0.2em] mb-6">
            {t('dashboard.evolution')}
          </h2>
          {reports.length > 0 ? (
            <RiskChart
              reports={reports}
              threshold={settings?.alert_threshold ?? 'HIGH'}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              {t('dashboard.no_data')}
            </div>
          )}
        </div>

        {/* Section 3 — Map */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-bold text-obsidian-on-surface-var uppercase tracking-[0.2em] mb-6">
            {t('dashboard.location')}
          </h2>
          <div className="h-64 rounded-xl overflow-hidden">
            <RiskMap
              lat={settings?.location_lat ?? 5.0703}
              lon={settings?.location_lon ?? -75.5138}
              alertLevel={latestReport?.alert_level ?? 'LOW'}
            />
          </div>
        </div>

        {/* Section 4 — Report History */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-bold text-obsidian-on-surface-var uppercase tracking-[0.2em] mb-6">
            {t('dashboard.history')}
          </h2>
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-obsidian-on-surface-var border-b border-obsidian-outline-var/50 text-[10px] uppercase tracking-widest">
                    <th className="text-left py-3 px-2">{t('dashboard.date')}</th>
                    <th className="text-left py-3 px-2">{t('dashboard.level')}</th>
                    <th className="text-right py-3 px-2">{t('dashboard.probability')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 10).map((r) => {
                    const style = ALERT_CONFIG[r.alert_level] ?? ALERT_CONFIG.LOW;
                    return (
                      <tr key={r.id} className="border-b border-obsidian-outline-var/30 hover:bg-obsidian-accent/5 transition-colors group">
                        <td className="py-3 px-2 text-obsidian-on-surface-var group-hover:text-obsidian-on-surface transition-colors font-body">
                          {new Date(r.created_at).toLocaleString(language === 'es' ? 'es-CO' : 'en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`${style.color} font-medium flex items-center gap-2`}>
                            {style.emoji} {r.alert_level}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-obsidian-on-surface font-mono">
                          {(r.risk_probability * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay reportes disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}
