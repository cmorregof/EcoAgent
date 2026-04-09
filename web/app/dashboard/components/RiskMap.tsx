// ---
// 📚 POR QUÉ: Mapa Leaflet centrado en la ubicación del usuario con marcador de riesgo.
//    El color del marcador cambia según alert_level, dando feedback visual instantáneo
//    sin leer texto. Leaflet se importa dinámicamente (no SSR) porque depende de window.
// 📁 ARCHIVO: web/app/dashboard/components/RiskMap.tsx
// ---

'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const MARKER_COLORS: Record<string, string> = {
  LOW: '#4ade80',    /* success */
  MEDIUM: '#f5c347', /* warn */
  HIGH: '#f97316',
  CRITICAL: '#ff6b6b', /* danger */
};

export default function RiskMap({
  lat,
  lon,
  alertLevel,
}: {
  lat: number;
  lon: number;
  alertLevel: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Prevent double initialization in React Strict Mode
      if (!isMounted || !mapRef.current || (mapRef.current as any)._leaflet_id) return;

      const map = L.map(mapRef.current, {
        center: [lat, lon],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      const color = MARKER_COLORS[alertLevel] ?? MARKER_COLORS.LOW;

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color};
          box-shadow: 0 0 20px ${color}80;
          border: 3px solid white;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([lat, lon], { icon: markerIcon }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, alertLevel]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" />;
}
