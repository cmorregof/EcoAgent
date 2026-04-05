// ---
// 📚 POR QUÉ: Verifica que el use case Orchestra correctamente la lógica de negocio:
//    voz SOLO se llama para HIGH/CRITICAL + voice_enabled, y errores de weather se
//    propagan sin inventar datos. Sin estos tests, un refactor podría silenciosamente
//    dejar de llamar synthesize(), o peor, generar reportes con datos ficticios.
// 📁 ARCHIVO: src/application/RiskAnalysisUseCase.test.ts
// ---

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RiskAnalysisUseCase } from './RiskAnalysisUseCase.js';
import type { ISimulationEngine, CIRSimulationOutput } from '../domain/ports/ISimulationEngine.js';
import type { IVoiceService } from '../domain/ports/IVoiceService.js';
import type { IWeatherService, WeatherData } from '../domain/ports/IWeatherService.js';
import type { ISessionRepository } from '../infrastructure/session/SessionRepository.js';
import type { UserSettings } from '../domain/models/UserSession.js';

// Mock logger
vi.mock('../config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
  },
}));

const MOCK_SETTINGS: UserSettings = {
  alert_threshold: 'HIGH',
  location_lat: 5.0703,
  location_lon: -75.5138,
  language: 'es',
  voice_enabled: true,
  report_frequency_hours: 6,
};

const MOCK_WEATHER: WeatherData = {
  temperature_c: 18,
  precipitation_mm: 12,
  humidity_pct: 85,
  wind_speed_kmh: 15,
  timestamp: new Date(),
};

function createMockSimulation(overrides: Partial<CIRSimulationOutput> = {}): CIRSimulationOutput {
  return {
    risk_probability: 0.8,
    mean_saturation: 0.65,
    std_saturation: 0.12,
    alert_level: 'CRITICAL',
    ...overrides,
  };
}

function createMocks() {
  const simulationEngine: ISimulationEngine = {
    simulate: vi.fn().mockResolvedValue(createMockSimulation()),
    healthCheck: vi.fn().mockResolvedValue(true),
  };

  const voiceService: IVoiceService = {
    synthesize: vi.fn().mockResolvedValue(Buffer.from('audio-data')),
  };

  const weatherService: IWeatherService = {
    getCurrentWeather: vi.fn().mockResolvedValue(MOCK_WEATHER),
  };

  const sessionRepo: ISessionRepository = {
    getOrCreate: vi.fn(),
    save: vi.fn(),
    getSettings: vi.fn().mockResolvedValue(MOCK_SETTINGS),
    updateSettings: vi.fn(),
    appendMessage: vi.fn(),
    getHistory: vi.fn().mockResolvedValue([]),
    saveReport: vi.fn(),
    isUserLinked: vi.fn().mockResolvedValue(true),
  };

  const openai: any = {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'AI summary' } }],
        }),
      },
    },
  };

  return { simulationEngine, voiceService, weatherService, sessionRepo, openai };
}

describe('RiskAnalysisUseCase', () => {
  // TEST: CRITICAL alert + voice_enabled → voice.synthesize() IS called.
  // WHY: High-risk situations require multi-channel alerts. If voice synthesis
  //      silently stops being called, users won't receive urgent audio alerts.
  it('calls voice.synthesize() when alert is CRITICAL and voice is enabled', async () => {
    const mocks = createMocks();
    (mocks.simulationEngine.simulate as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockSimulation({ alert_level: 'CRITICAL' })
    );

    const useCase = new RiskAnalysisUseCase(
      mocks.simulationEngine,
      mocks.voiceService,
      mocks.weatherService,
      mocks.sessionRepo,
      mocks.openai
    );

    await useCase.analyzeRisk('chat-123');

    expect(mocks.voiceService.synthesize).toHaveBeenCalledOnce();
  });

  // TEST: LOW alert → voice.synthesize() is NOT called.
  // WHY: Voice synthesis costs money (ElevenLabs API). Calling it for LOW risk
  //      wastes credits and annoys users with unnecessary audio messages.
  it('does NOT call voice.synthesize() when alert is LOW', async () => {
    const mocks = createMocks();
    (mocks.simulationEngine.simulate as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockSimulation({ alert_level: 'LOW', risk_probability: 0.05 })
    );

    const useCase = new RiskAnalysisUseCase(
      mocks.simulationEngine,
      mocks.voiceService,
      mocks.weatherService,
      mocks.sessionRepo,
      mocks.openai
    );

    await useCase.analyzeRisk('chat-123');

    expect(mocks.voiceService.synthesize).not.toHaveBeenCalled();
  });

  // TEST: Weather service failure → error propagates, no fabricated data.
  // WHY: Anti-hallucination requirement. If weather data can't be fetched,
  //      the use case MUST throw — never generate a report with fake data.
  it('propagates weather service errors without fabricating data', async () => {
    const mocks = createMocks();
    (mocks.weatherService.getCurrentWeather as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Weather API timeout')
    );

    const useCase = new RiskAnalysisUseCase(
      mocks.simulationEngine,
      mocks.voiceService,
      mocks.weatherService,
      mocks.sessionRepo,
      mocks.openai
    );

    await expect(useCase.analyzeRisk('chat-123')).rejects.toThrow('Weather API timeout');

    // Simulation should NOT have been called — no fake data path
    expect(mocks.simulationEngine.simulate).not.toHaveBeenCalled();
  });

  // TEST: HIGH alert + voice_enabled → voice IS called (not just CRITICAL).
  // WHY: Both HIGH and CRITICAL are actionable alert levels for voice.
  it('calls voice.synthesize() when alert is HIGH and voice is enabled', async () => {
    const mocks = createMocks();
    (mocks.simulationEngine.simulate as ReturnType<typeof vi.fn>).mockResolvedValue(
      createMockSimulation({ alert_level: 'HIGH', risk_probability: 0.5 })
    );

    const useCase = new RiskAnalysisUseCase(
      mocks.simulationEngine,
      mocks.voiceService,
      mocks.weatherService,
      mocks.sessionRepo,
      mocks.openai
    );

    await useCase.analyzeRisk('chat-123');

    expect(mocks.voiceService.synthesize).toHaveBeenCalledOnce();
  });
});
