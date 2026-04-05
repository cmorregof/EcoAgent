// ---
// 📚 POR QUÉ: Define los tipos de dominio para sesiones de usuario multi-tenant.
//    Cada UserSession está aislada por telegram_chat_id — NUNCA se comparten datos
//    entre usuarios. Sin este aislamiento, un usuario podría ver el historial o
//    configuración de otro, lo cual es inaceptable en un sistema SaaS.
// 📁 ARCHIVO: src/domain/models/UserSession.ts
// ---

export type AlertThreshold = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserSettings {
  readonly alert_threshold: AlertThreshold;
  readonly location_lat: number;
  readonly location_lon: number;
  readonly language: string;
  readonly voice_enabled: boolean;
  readonly report_frequency_hours: number;
}

export interface Message {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: Date;
}

/**
 * Represents a single user's session state.
 *
 * INVARIANT: UserSession instances are NEVER shared between chat_ids.
 * Each telegram_chat_id maps to exactly one independent session.
 * This is the fundamental multi-tenancy isolation boundary.
 */
export interface UserSession {
  readonly telegram_chat_id: string;
  readonly user_id: string;
  readonly settings: UserSettings;
  readonly conversation_history: readonly Message[];
}

/** Default settings for new users. */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  alert_threshold: 'HIGH',
  location_lat: 5.0703,    // Manizales, Colombia
  location_lon: -75.5138,
  language: 'es',
  voice_enabled: true,
  report_frequency_hours: 6,
} as const;
