// ---
// 📚 POR QUÉ: Componente de gráfica Recharts para visualizar la evolución temporal del riesgo.
//    La línea de umbral horizontal permite al usuario ver de un vistazo si su configuración
//    actual los habría alertado en el pasado. Esto es una herramienta de calibración visual.
// 📁 ARCHIVO: web/app/dashboard/components/RiskChart.tsx
// ---

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface Report {
  created_at: string;
  risk_probability: number;
  alert_level: string;
}

const THRESHOLD_VALUES: Record<string, number> = {
  LOW: 0.15,
  MEDIUM: 0.4,
  HIGH: 0.7,
  CRITICAL: 0.9,
};

export default function RiskChart({
  reports,
  threshold,
}: {
  reports: Report[];
  threshold: string;
}) {
  const data = [...reports]
    .reverse()
    .map((r) => ({
      time: new Date(r.created_at).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      probability: r.risk_probability,
      alert: r.alert_level,
    }));

  const thresholdValue = THRESHOLD_VALUES[threshold] ?? 0.7;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="time"
          stroke="#475569"
          fontSize={12}
          tick={{ fill: '#64748b' }}
        />
        <YAxis
          domain={[0, 1]}
          stroke="#475569"
          fontSize={12}
          tick={{ fill: '#64748b' }}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probabilidad']}
        />
        <ReferenceLine
          y={thresholdValue}
          stroke="#f97316"
          strokeDasharray="5 5"
          label={{
            value: `Umbral: ${threshold}`,
            fill: '#f97316',
            fontSize: 11,
          }}
        />
        <Line
          type="monotone"
          dataKey="probability"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', r: 3 }}
          activeDot={{ r: 5, fill: '#22c55e' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
