// ---
// 📚 POR QUÉ: Define el contrato entre la aplicación y el motor de simulación CIR.
//    Usando una interfaz (port), el bot no depende directamente de la implementación Python.
//    Esto permite testear con mocks, cambiar el engine a Rust/C++ sin tocar el bot,
//    y validar inputs/outputs con Zod en ambos lados del contrato.
// 📁 ARCHIVO: src/domain/ports/ISimulationEngine.ts
// ---

import { z } from 'zod';

// ── Input Schema ─────────────────────────────────────────────
export const CIRSimulationInputSchema = z.object({
  /** Accumulated precipitation in millimeters. Drives soil moisture increase. */
  precipitation_mm: z.number().min(0, 'Precipitation cannot be negative'),

  /** Relative humidity as percentage (0–100). Amplifies saturation risk. */
  humidity_pct: z.number().min(0).max(100),

  /** Air temperature in Celsius. Affects evaporation rate. */
  temperature_c: z.number(),

  /** Number of Monte Carlo paths to simulate. More = higher confidence. */
  n_simulations: z.number().int().min(1).max(10000).default(1000),

  /** Forward time horizon in hours for the simulation. */
  time_horizon_hours: z.number().positive().default(24),
});

export type CIRSimulationInput = z.infer<typeof CIRSimulationInputSchema>;

// ── Output Schema ────────────────────────────────────────────
export const AlertLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type AlertLevel = z.infer<typeof AlertLevelSchema>;

export const CIRSimulationOutputSchema = z.object({
  /** Probability of exceeding critical soil saturation threshold (0–1). */
  risk_probability: z.number().min(0).max(1),

  /** Mean soil saturation across all Monte Carlo paths. */
  mean_saturation: z.number(),

  /** Standard deviation of saturation — measures simulation uncertainty. */
  std_saturation: z.number().min(0),

  /** Discrete alert level derived from risk_probability thresholds. */
  alert_level: AlertLevelSchema,
});

export type CIRSimulationOutput = z.infer<typeof CIRSimulationOutputSchema>;

// ── Port Interface ───────────────────────────────────────────
export interface ISimulationEngine {
  /**
   * Runs a CIR stochastic simulation with the given climate inputs.
   * @throws SimulationServiceUnavailableError when the engine is unreachable
   * @throws SimulationValidationError when the response fails schema validation
   * @throws SimulationRateLimitError when the engine returns HTTP 429
   */
  simulate(input: CIRSimulationInput): Promise<CIRSimulationOutput>;

  /**
   * Checks whether the simulation engine is reachable and healthy.
   */
  healthCheck(): Promise<boolean>;
}
