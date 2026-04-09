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
        <CartesianGrid strokeDasharray="3 3" stroke="#2a282c" vertical={false} />
        <XAxis
          dataKey="time"
          stroke="#4a484c"
          fontSize={10}
          tick={{ fill: '#a89fa8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 1]}
          stroke="#4a484c"
          fontSize={10}
          tick={{ fill: '#a89fa8' }}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#131315',
            border: '1px solid #4a484c',
            borderRadius: '12px',
            color: '#e8e4e7',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }}
          itemStyle={{ color: '#57f1db' }}
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
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#0e0e10' }}
          activeDot={{ r: 6, fill: '#57f1db', stroke: '#0e0e10', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
