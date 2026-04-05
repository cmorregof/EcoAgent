// ---
// 📚 POR QUÉ: Define el contrato para obtener datos meteorológicos en tiempo real.
//    Separar la interfaz de la implementación (Open-Meteo) permite cambiar el proveedor
//    sin tocar la lógica del bot, y testear con datos deterministas en los tests.
//    Las coordenadas por defecto centran el servicio en Manizales, Colombia.
// 📁 ARCHIVO: src/domain/ports/IWeatherService.ts
// ---

import { z } from 'zod';

// ── Default coordinates for Manizales, Colombia ──────────────
export const MANIZALES_LAT = 5.0703;
export const MANIZALES_LON = -75.5138;

// ── Weather Data Schema ──────────────────────────────────────
export const WeatherDataSchema = z.object({
  /** Air temperature at 2m height in Celsius. */
  temperature_c: z.number(),

  /** Accumulated precipitation in millimeters. */
  precipitation_mm: z.number(),

  /** Relative humidity as percentage (0–100). */
  humidity_pct: z.number(),

  /** Wind speed at 10m height in km/h. */
  wind_speed_kmh: z.number(),

  /** Timestamp of the weather observation. */
  timestamp: z.coerce.date(),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

// ── Port Interface ───────────────────────────────────────────
export interface IWeatherService {
  /**
   * Fetches current weather conditions for the given coordinates.
   * Defaults to Manizales if no coordinates are provided.
   */
  getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData>;
}
