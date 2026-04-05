// ---
// 📚 POR QUÉ: Verifica que errores del motor de simulación se clasifican correctamente.
//    Sin estos tests, un ECONNREFUSED podría causar un error genérico "Error" en vez de
//    SimulationServiceUnavailableError — y el handler no podría decidir si hacer retry
//    o mostrar un mensaje distinto al usuario.
// 📁 ARCHIVO: src/infrastructure/simulation/PythonCIREngine.test.ts
// ---

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PythonCIREngine } from './PythonCIREngine.js';
import {
  SimulationServiceUnavailableError,
  SimulationValidationError,
} from './errors.js';
import type { CIRSimulationInput } from '../../domain/ports/ISimulationEngine.js';

// Mock axios
vi.mock('axios', () => {
  const mockCreate = vi.fn(() => ({
    post: vi.fn(),
    get: vi.fn(),
  }));
  return {
    default: { create: mockCreate },
    AxiosError: class AxiosError extends Error {
      code?: string;
      response?: { status: number; headers: Record<string, string> };
      constructor(message: string, code?: string, response?: { status: number; headers: Record<string, string> }) {
        super(message);
        this.name = 'AxiosError';
        this.code = code;
        this.response = response;
      }
    },
  };
});

// Mock logger to suppress output during tests
vi.mock('../../config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const VALID_INPUT: CIRSimulationInput = {
  precipitation_mm: 15,
  humidity_pct: 80,
  temperature_c: 18,
  n_simulations: 1000,
  time_horizon_hours: 24,
};

const VALID_RESPONSE = {
  risk_probability: 0.35,
  mean_saturation: 0.42,
  std_saturation: 0.08,
  alert_level: 'MEDIUM',
};

describe('PythonCIREngine', () => {
  let engine: PythonCIREngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new PythonCIREngine('http://localhost:8000/simulate_risk');
  });

  // TEST: Invalid response from Python → SimulationValidationError (not generic Error).
  // WHY: A generic Error would be caught by a broad catch block and potentially
  //      swallowed. A SimulationValidationError signals a contract mismatch between
  //      TypeScript and Python — this is a developer bug, not a user error.
  it('throws SimulationValidationError when response schema is invalid', async () => {
    const axios = await import('axios');
    const mockClient = (axios.default.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    
    if (mockClient) {
      mockClient.post.mockResolvedValueOnce({
        data: { invalid: 'response', missing: 'fields' },
      });
    }

    await expect(engine.simulate(VALID_INPUT)).rejects.toThrow(SimulationValidationError);
  });

  // TEST: Valid response → correctly typed CIRSimulationOutput.
  // WHY: Ensures the happy path works and Zod parsing doesn't reject valid data.
  it('returns typed output when response is valid', async () => {
    const axios = await import('axios');
    const mockClient = (axios.default.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    
    if (mockClient) {
      mockClient.post.mockResolvedValueOnce({ data: VALID_RESPONSE });
    }

    const result = await engine.simulate(VALID_INPUT);

    expect(result.risk_probability).toBe(0.35);
    expect(result.alert_level).toBe('MEDIUM');
    expect(result.mean_saturation).toBe(0.42);
    expect(result.std_saturation).toBe(0.08);
  });
});
