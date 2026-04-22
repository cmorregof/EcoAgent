import { describe, expect, it, vi } from 'vitest';
import { LocalCIREngine } from './LocalCIREngine.js';

vi.mock('../../config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('LocalCIREngine', () => {
  it('produces a valid CIR output shape within expected bounds', async () => {
    const engine = new LocalCIREngine();

    const result = await engine.simulate({
      precipitation_mm: 14,
      humidity_pct: 86,
      temperature_c: 18,
      n_simulations: 250,
      time_horizon_hours: 24,
    });

    expect(result.risk_probability).toBeGreaterThanOrEqual(0);
    expect(result.risk_probability).toBeLessThanOrEqual(1);
    expect(result.mean_saturation).toBeGreaterThanOrEqual(0);
    expect(result.std_saturation).toBeGreaterThanOrEqual(0);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.alert_level);
  });
});
