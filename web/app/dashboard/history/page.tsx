'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

const ALERT_CONFIG: Record<string, { color: string; label: string }> = {
  LOW: { color: 'green', label: 'Bajo' },
  MEDIUM: { color: 'amber', label: 'Medio' },
  HIGH: { color: 'red', label: 'Alto' },
  CRITICAL: { color: 'red', label: 'Crítico' },
};

export default function HistoryPage() {
  const [reports, setReports] = useState<RiskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch up to 100 recent reports for the history page
    const { data } = await supabase
      .from('risk_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setReports(data);
    setLoading(false);
    
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

  return (
    <>
      <div className="section-header reveal">
        <div className="section-tag">REGISTRO COMPLETO</div>
        <div className="section-line"></div>
      </div>

      <div className="panel reveal">
        <div className="panel-header">
          <div className="panel-title">HISTORIAL DE SIMULACIONES Y ALERTAS</div>
          <div className="panel-tag">ÚLTIMOS 100 REGISTROS</div>
        </div>
        <div className="panel-body p-0">
          <div className="overflow-x-auto">
            <table className="history-table w-full">
              <thead>
                <tr>
                  <th>FECHA / HORA</th>
                  <th>NIVEL ALERTA</th>
                  <th>PROBABILIDAD (%)</th>
                  <th>SATURACIÓN</th>
                  <th>PRECIPITACIÓN</th>
                  <th>TEMP / HUMEDAD</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
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
                      <td className="font-mono text-obsidian-on-surface-var">
                        {r.precipitation_mm.toFixed(1)} mm
                      </td>
                      <td className="font-mono text-obsidian-on-surface-var">
                        {r.temperature_c.toFixed(1)}°C / {r.humidity_pct.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-obsidian-on-surface-var">No hay reportes disponibles en el historial.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
