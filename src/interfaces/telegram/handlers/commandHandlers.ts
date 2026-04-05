// ---
// 📚 POR QUÉ: Maneja todos los comandos del bot de Telegram de forma estructurada.
//    Cada handler recibe las dependencias por parámetro (no importa módulos globales),
//    lo que permite testear cada comando en aislamiento. Los emojis de alerta son
//    consistentes en toda la plataforma: 🟢 LOW, 🟡 MEDIUM, 🟠 HIGH, 🔴 CRITICAL.
// 📁 ARCHIVO: src/interfaces/telegram/handlers/commandHandlers.ts
// ---

import { InputFile } from 'grammy';
import type { EcoAgentContext } from '../middleware/authMiddleware.js';
import type { RiskAnalysisUseCase } from '../../../application/RiskAnalysisUseCase.js';
import type { ISessionRepository } from '../../../infrastructure/session/SessionRepository.js';
import type { AlertThreshold } from '../../../domain/models/UserSession.js';
import { logger } from '../../../config/logger.js';

const ALERT_EMOJI: Record<AlertThreshold, string> = {
  LOW: '🟢',
  MEDIUM: '🟡',
  HIGH: '🟠',
  CRITICAL: '🔴',
};

// ── /start ───────────────────────────────────────────────────
export function handleStart() {
  return async (ctx: EcoAgentContext): Promise<void> => {
    const name = ctx.from?.first_name ?? 'usuario';

    const chatId = ctx.chat?.id?.toString() ?? 'ID_NO_DISPONIBLE';

    await ctx.reply(
      `¡Hola ${name}! 👋\n\n` +
      `Soy *EcoAgent*, tu asistente de riesgo climático e IA.\n\n` +
      `📍 Estoy monitoreando *Manizales, Colombia* por defecto.\n\n` +
      `🔑 **Tu código secreto de vinculación web es:** \`${chatId}\`\n\n` +
      `Comandos disponibles:\n` +
      `/clima — Análisis de riesgo en tiempo real\n` +
      `/configurar — Ver y cambiar tu configuración\n` +
      `/ayuda — Lista completa de comandos`,
      { parse_mode: 'Markdown' }
    );
  };
}

// ── /clima ───────────────────────────────────────────────────
export function handleClima(riskAnalysis: RiskAnalysisUseCase) {
  return async (ctx: EcoAgentContext): Promise<void> => {
    const chatId = ctx.chat?.id?.toString();
    if (!chatId) return;

    try {
      await ctx.replyWithChatAction('typing');

      const report = await riskAnalysis.analyzeRisk(chatId);
      const emoji = ALERT_EMOJI[report.alert_level];

      let message =
        `🎲 *Simulación Estocástica CIR (Euler-Maruyama)*\n` +
        `📍 Manizales, Caldas\n\n` +
        `📊 *Datos Meteorológicos:*\n` +
        `• Temp: ${report.weather.temperature_c}°C\n` +
        `• Precipitación: ${report.weather.precipitation_mm}mm\n` +
        `• Humedad: ${report.weather.humidity_pct}%\n` +
        `• Viento: ${report.weather.wind_speed_kmh}km/h\n\n` +
        `${emoji} *Nivel de Riesgo: ${report.alert_level}*\n` +
        `📈 Probabilidad: ${(report.simulation.risk_probability * 100).toFixed(1)}%\n` +
        `📉 Saturación media: ${report.simulation.mean_saturation.toFixed(4)} ± ${report.simulation.std_saturation.toFixed(4)}`;

      if (report.ai_summary) {
        message += `\n\n💡 *Resumen Ejecutivo (IA)*:\n${report.ai_summary}`;
      }

      await ctx.reply(message, { parse_mode: 'Markdown' });

      // If voice buffer is available, send as voice message
      if (report.audio_buffer) {
        await ctx.replyWithVoice(
          new InputFile(report.audio_buffer, 'alerta_ecoagent.mp3')
        );
      }
    } catch (err: unknown) {
      logger.error({ err, chatId }, 'Error in /clima command');
      await ctx.reply(
        'No puedo obtener datos en tiempo real en este momento. ' +
        'Intenta de nuevo en unos minutos.'
      );
    }
  };
}

// ── /configurar ──────────────────────────────────────────────
export function handleConfigurar(sessionRepo: ISessionRepository) {
  return async (ctx: EcoAgentContext): Promise<void> => {
    const session = ctx.session;
    if (!session) return;

    const s = session.settings;
    const emoji = ALERT_EMOJI[s.alert_threshold];

    await ctx.reply(
      `⚙️ *Tu Configuración Actual*\n\n` +
      `${emoji} Umbral de alerta: *${s.alert_threshold}*\n` +
      `📍 Ubicación: ${s.location_lat}, ${s.location_lon}\n` +
      `🔊 Voz: ${s.voice_enabled ? 'Habilitada' : 'Deshabilitada'}\n` +
      `🌐 Idioma: ${s.language}\n` +
      `⏰ Frecuencia de reportes: cada ${s.report_frequency_hours}h\n\n` +
      `Para cambiar tu umbral de alerta, envía:\n` +
      `\`/umbral LOW\`, \`/umbral MEDIUM\`, \`/umbral HIGH\`, o \`/umbral CRITICAL\``,
      { parse_mode: 'Markdown' }
    );
  };
}

// ── /umbral [LEVEL] ──────────────────────────────────────────
export function handleUmbral(sessionRepo: ISessionRepository) {
  return async (ctx: EcoAgentContext): Promise<void> => {
    const chatId = ctx.chat?.id?.toString();
    if (!chatId) return;

    const text = ctx.message?.text ?? '';
    const newLevel = text.replace('/umbral', '').trim().toUpperCase();
    const validLevels: AlertThreshold[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    if (!validLevels.includes(newLevel as AlertThreshold)) {
      await ctx.reply(
        'Nivel inválido. Usa: `/umbral LOW`, `/umbral MEDIUM`, `/umbral HIGH`, o `/umbral CRITICAL`',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    await sessionRepo.updateSettings(chatId, {
      alert_threshold: newLevel as AlertThreshold,
    });

    const emoji = ALERT_EMOJI[newLevel as AlertThreshold];
    await ctx.reply(`${emoji} Umbral de alerta actualizado a *${newLevel}*`, {
      parse_mode: 'Markdown',
    });
  };
}

// ── /ayuda ───────────────────────────────────────────────────
export function handleAyuda() {
  return async (ctx: EcoAgentContext): Promise<void> => {
    await ctx.reply(
      `📖 *Comandos de EcoAgent*\n\n` +
      `/clima — Análisis de riesgo en tiempo real con simulación CIR\n` +
      `/configurar — Ver tu configuración actual\n` +
      `/umbral [NIVEL] — Cambiar umbral de alerta (LOW/MEDIUM/HIGH/CRITICAL)\n` +
      `/ayuda — Esta lista de comandos\n\n` +
      `También puedes escribirme en lenguaje natural y te ayudaré con consultas sobre riesgo climático.`,
      { parse_mode: 'Markdown' }
    );
  };
}
