// ---
// 📚 POR QUÉ: Envuelve el motor Python con un fallback local para continuidad operativa.
//    El bot debería preferir el servicio Python por observabilidad y aislamiento, pero si
//    ese servicio cae, el usuario no debe quedarse sin `/clima`. Este wrapper cambia
//    solamente el punto de fallo de infraestructura, no el contrato del dominio.
// 📁 ARCHIVO: src/infrastructure/simulation/FailoverSimulationEngine.ts
// ---

import type {
  CIRSimulationInput,
  CIRSimulationOutput,
  ISimulationEngine,
} from '../../domain/ports/ISimulationEngine.js';
import {
  SimulationRateLimitError,
  SimulationServiceUnavailableError,
  SimulationValidationError,
} from './errors.js';
import { logger } from '../../config/logger.js';

export class FailoverSimulationEngine implements ISimulationEngine {
  constructor(
    private readonly primary: ISimulationEngine,
    private readonly fallback: ISimulationEngine
  ) {}

  async simulate(input: CIRSimulationInput): Promise<CIRSimulationOutput> {
    try {
      return await this.primary.simulate(input);
    } catch (err) {
      const shouldFallback =
        err instanceof SimulationServiceUnavailableError ||
        err instanceof SimulationRateLimitError ||
        err instanceof SimulationValidationError;

      if (!shouldFallback) {
        throw err;
      }

      logger.warn({ err }, 'Primary simulation engine failed; using fallback engine');
      return this.fallback.simulate(input);
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.primary.healthCheck();
  }
}
