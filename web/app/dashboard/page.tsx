'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import dynamic from 'next/dynamic';

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

const ALERT_CONFIG: Record<string, { color: string; label: string }> = {
  LOW: { color: 'green', label: 'Bajo' },
  MEDIUM: { color: 'amber', label: 'Medio' },
  HIGH: { color: 'red', label: 'Alto' },
  CRITICAL: { color: 'red', label: 'Crítico' },
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
    
    // Trigger reveals
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-obsidian-on-surface-var animate-pulse font-mono text-sm tracking-widest">{t('common.loading')}</div>
      </div>
    );
  }

  const latestReport = reports[0];
  const alertStyle = latestReport ? ALERT_CONFIG[latestReport.alert_level] ?? ALERT_CONFIG.LOW : ALERT_CONFIG.LOW;

  return (
    <>
      <div className="section-header reveal">
        <div className="section-tag">RESUMEN METEOROLÓGICO Y RIESGO</div>
        <div className="section-line"></div>
      </div>

      <div className="kpi-grid reveal">
        <div className="kpi-card featured">
          <div className="kpi-label">RIESGO ACTUAL</div>
          <div className={`kpi-value ${alertStyle.color}`}>
            {latestReport ? latestReport.alert_level : '—'}
          </div>
          <div className={`kpi-delta ${alertStyle.color === 'red' ? 'down' : 'up'}`}>
            Prob. Deslizamiento: {latestReport ? (latestReport.risk_probability * 100).toFixed(1) : 0}%
          </div>
          <div className="kpi-sub">MODELO CIR + POISSON JUMPS</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-label">PRECIPITACIÓN (ACUMULADA)</div>
          <div className="kpi-value">{latestReport ? latestReport.precipitation_mm.toFixed(1) : '—'}</div>
          <div className="kpi-delta" style={{ color: 'var(--on-surface-var)' }}>Milímetros (mm)</div>
          <div className="kpi-sub">ESTACIÓN MANIZALES</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">TEMPERATURA / HUMEDAD</div>
          <div className="kpi-value">{latestReport ? `${latestReport.temperature_c.toFixed(1)}°` : '—'}</div>
          <div className="kpi-delta" style={{ color: 'var(--accent)' }}>
            Humedad: {latestReport ? `${latestReport.humidity_pct.toFixed(0)}%` : '—'}
          </div>
          <div className="kpi-sub">DATOS OPEN-METEO</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">SATURACIÓN DE SUELO</div>
          <div className={`kpi-value ${latestReport && latestReport.mean_saturation > 80 ? 'red' : ''}`}>
            {latestReport ? `${latestReport.mean_saturation.toFixed(1)}%` : '—'}
          </div>
          <div className="kpi-delta" style={{ color: 'var(--on-surface-var)' }}>Media modelada (Hydrus)</div>
          <div className="kpi-sub">LADERA OESTE</div>
        </div>
      </div>

      <div className="two-col mt-8">
        <div className="panel reveal">
          <div className="panel-header">
            <div className="panel-title">EVOLUCIÓN DEL RIESGO</div>
            <div className="panel-tag">TIME SERIES</div>
          </div>
          <div className="panel-body">
            {reports.length > 0 ? (
              <RiskChart reports={reports} threshold={settings?.alert_threshold ?? 'HIGH'} />
            ) : (
              <div className="h-48 flex items-center justify-center font-mono text-obsidian-outline text-xs">
                {t('dashboard.no_data')}
              </div>
            )}
          </div>
        </div>

        <div className="panel reveal">
          <div className="panel-header">
            <div className="panel-title">MAPA DE RIESGO GEOSESPACIAL</div>
            <div className="panel-tag">SPATIAL RISK MAP</div>
          </div>
          <div className="panel-body p-0 h-[280px]">
            <RiskMap
              lat={settings?.location_lat ?? 5.0703}
              lon={settings?.location_lon ?? -75.5138}
              alertLevel={latestReport?.alert_level ?? 'LOW'}
            />
          </div>
        </div>
      </div>

      <div className="panel reveal mt-8">
        <div className="panel-header">
          <div className="panel-title">HISTORIAL DE SIMULACIONES</div>
          <div className="panel-tag">SYSTEM LOGS</div>
        </div>
        <div className="panel-body p-0">
          <table className="history-table">
            <thead>
              <tr>
                <th>FECHA / HORA</th>
                <th>NIVEL ALERTA</th>
                <th>PROBABILIDAD (%)</th>
                <th>SATURACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map((r) => {
                const style = ALERT_CONFIG[r.alert_level] ?? ALERT_CONFIG.LOW;
                return (
                  <tr key={r.id}>
                    <td>
                      {new Date(r.created_at).toLocaleString(language === 'es' ? 'es-CO' : 'en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className={`font-medium td-cvar ${style.color === 'amber' ? 'med' : style.color === 'red' ? 'high' : 'low'}`}>
                      {r.alert_level}
                    </td>
                    <td className="font-mono text-obsidian-on-surface">
                      {(r.risk_probability * 100).toFixed(1)}%
                    </td>
                    <td className="font-mono text-obsidian-on-surface">
                      {r.mean_saturation.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6">No hay reportes disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
