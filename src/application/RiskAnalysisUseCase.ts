// ---
// 📚 POR QUÉ: Orquesta el flujo completo de análisis de riesgo como un caso de uso.
//    Recibe todas las dependencias por constructor (DI) para testabilidad total.
//    El flujo weather→simulation→voice es secuencial e inmutable: si falta un paso,
//    el reporte se degrada gracefully (sin voz, pero con datos). Esto es el corazón
//    de la lógica de negocio, desacoplada de Telegram, HTTP, o cualquier framework.
// 📁 ARCHIVO: src/application/RiskAnalysisUseCase.ts
// ---

import type { ISimulationEngine, CIRSimulationOutput } from '../domain/ports/ISimulationEngine.js';
import type { IVoiceService } from '../domain/ports/IVoiceService.js';
import type { IWeatherService, WeatherData } from '../domain/ports/IWeatherService.js';
import type { ISessionRepository } from '../infrastructure/session/SessionRepository.js';
import { type AlertThreshold, DEFAULT_USER_SETTINGS } from '../domain/models/UserSession.js';
import { logger } from '../config/logger.js';
import type OpenAI from 'openai';
import { settings as appSettings } from '../config/settings.js';

// ── RiskReport Type ──────────────────────────────────────────
export interface RiskReport {
  readonly weather: WeatherData;
  readonly simulation: CIRSimulationOutput;
  readonly audio_buffer?: Buffer;
  readonly generated_at: Date;
  readonly alert_level: AlertThreshold;
  readonly ai_summary?: string;
}

export class RiskAnalysisUseCase {
  constructor(
    private readonly simulationEngine: ISimulationEngine,
    private readonly voiceService: IVoiceService,
    private readonly weatherService: IWeatherService,
    private readonly sessionRepo: ISessionRepository,
    private readonly openai: OpenAI
  ) {}

  /**
   * Full risk analysis pipeline for a specific user.
   *
   * Flow:
   * 1. Read user settings → get their location and preferences
   * 2. Fetch current weather → real-time climate data
   * 3. Run CIR simulation → stochastic risk assessment
   * 4. Generate AI Executive Summary via OpenRouter
   * 5. If HIGH/CRITICAL + voice_enabled → synthesize voice report
   * 6. Save result to conversation history
   * 7. Return typed RiskReport
   */
  async analyzeRisk(chatId: string): Promise<RiskReport> {
    const startTime = Date.now();

    // 1. Load user settings — fallback to defaults if not found in SaaS DB
    const settings = (await this.sessionRepo.getSettings(chatId)) ?? DEFAULT_USER_SETTINGS;

    logger.info({ chatId, lat: settings.location_lat, lon: settings.location_lon }, 'Starting risk analysis');

    // 2. Fetch current weather for user's configured location
    const weather = await this.weatherService.getCurrentWeather(
      settings.location_lat,
      settings.location_lon
    );

    // 3. Run CIR simulation with weather data
    const simulation = await this.simulationEngine.simulate({
      precipitation_mm: weather.precipitation_mm,
      humidity_pct: weather.humidity_pct,
      temperature_c: weather.temperature_c,
      n_simulations: 1000,
      time_horizon_hours: 24,
    });

    // 4. Generate AI Executive Summary
    let aiSummary = '';
    try {
      const summaryRes = await this.openai.chat.completions.create({
        model: appSettings.OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en climatología y gestión de riesgo de deslizamientos. Recibes datos crudos (temperatura en °C, precipitación en mm, humedad %, probabilidad de riesgo %, nivel de riesgo de LOW a CRITICAL) correspondientes al estado actual para alertar al usuario de su ubicación. Debes escribir un resumen ejecutivo simple y directo de máximo 2 a 3 líneas explicando qué significan estos datos y si debe preocuparse. NUNCA uses markdown (ej. asteriscos o negritas) ni saludes.'
          },
          {
            role: 'user',
            content: `Datos de entrada: Temp: ${weather.temperature_c}°C, Precipitación: ${weather.precipitation_mm}mm, Humedad: ${weather.humidity_pct}%. Probabilidad de deslizamiento: ${(simulation.risk_probability * 100).toFixed(1)}%. Nivel de Alerta: ${simulation.alert_level}.`
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
      });
      aiSummary = summaryRes.choices[0]?.message?.content?.trim() || '';
    } catch (err) {
      logger.error({ err }, 'Failed to generate AI summary for risk report');
      aiSummary = 'No fue posible generar el resumen con IA en este momento.';
    }

    // 5. Voice synthesis — only for HIGH/CRITICAL + voice_enabled
    let audioBuffer: Buffer | undefined;

    const isHighRisk =
      simulation.alert_level === 'HIGH' || simulation.alert_level === 'CRITICAL';

    if (isHighRisk && settings.voice_enabled) {
      const summaryText = this.buildVoiceSummary(weather, simulation);
      const buffer = await this.voiceService.synthesize(summaryText);
      if (buffer) {
        audioBuffer = buffer;
      }
    }

    // 6. Save to conversation history
    const reportMessage = this.buildReportMessage(weather, simulation, aiSummary);
    await this.sessionRepo.appendMessage(chatId, {
      role: 'assistant',
      content: reportMessage,
      timestamp: new Date(),
    });

    const elapsed = Date.now() - startTime;
    logger.info(
      { chatId, alert_level: simulation.alert_level, elapsed_ms: elapsed, hasAudio: !!audioBuffer, hasSummary: !!aiSummary },
      'Risk analysis completed'
    );

    // 7. Return typed report
    const report: RiskReport = {
      weather,
      simulation,
      ... (audioBuffer ? { audio_buffer: audioBuffer } : {}),
      generated_at: new Date(),
      alert_level: simulation.alert_level,
      ai_summary: aiSummary,
    };

    // 8. Output data to Supabase
    await this.sessionRepo.saveReport(chatId, report);

    return report;
  }

  private buildVoiceSummary(weather: WeatherData, sim: CIRSimulationOutput): string {
    return (
      `Alerta de riesgo climático. ` +
      `Nivel: ${sim.alert_level}. ` +
      `Probabilidad de riesgo: ${(sim.risk_probability * 100).toFixed(1)} por ciento. ` +
      `Temperatura actual: ${weather.temperature_c} grados. ` +
      `Precipitación: ${weather.precipitation_mm} milímetros. ` +
      `Humedad: ${weather.humidity_pct} por ciento. ` +
      `Se recomienda monitoreo constante.`
    );
  }

  private buildReportMessage(weather: WeatherData, sim: CIRSimulationOutput, aiSummary: string): string {
    const emoji =
      sim.alert_level === 'CRITICAL' ? '🔴' :
      sim.alert_level === 'HIGH' ? '🟠' :
      sim.alert_level === 'MEDIUM' ? '🟡' : '🟢';

    return (
      `${emoji} Análisis de Riesgo — ${sim.alert_level}\n` +
      `Probabilidad: ${(sim.risk_probability * 100).toFixed(1)}%\n` +
      `Saturación media: ${sim.mean_saturation.toFixed(4)}\n` +
      `Temp: ${weather.temperature_c}°C | Lluvia: ${weather.precipitation_mm}mm | Humedad: ${weather.humidity_pct}%\n\n` +
      `💡 *Resumen Ejecutivo (IA)*:\n${aiSummary}`
    );
  }
}
