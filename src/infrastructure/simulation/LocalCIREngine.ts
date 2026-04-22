// ---
// 📚 POR QUÉ: Provee un motor CIR local en TypeScript como respaldo del servicio Python.
//    Si el microservicio FastAPI está caído o inaccesible, el bot no debe quedar inútil.
//    Este fallback conserva la misma lógica central (Euler-Maruyama + Monte Carlo) para
//    mantener continuidad operativa sin inventar datos ni degradar a reglas estáticas.
// 📁 ARCHIVO: src/infrastructure/simulation/LocalCIREngine.ts
// ---

import type {
  CIRSimulationInput,
  CIRSimulationOutput,
  ISimulationEngine,
} from '../../domain/ports/ISimulationEngine.js';
import { logger } from '../../config/logger.js';

export class LocalCIREngine implements ISimulationEngine {
  async simulate(input: CIRSimulationInput): Promise<CIRSimulationOutput> {
    const startTime = Date.now();

    const a = 0.5;
    const sigma = 0.1;

    let b = 0.4;
    b += input.precipitation_mm * 0.05;
    b += (input.humidity_pct / 100) * 0.2;

    const evaporationFactor = Math.max(0, 1 - (input.temperature_c / 50) * 0.1);
    b *= evaporationFactor;

    const sigmaAdjusted = sigma * (1 + input.precipitation_mm / 20);

    const totalTime = input.time_horizon_hours / 24;
    const steps = 100;
    const dt = totalTime / steps;
    const criticalThreshold = 0.6;

    const maxSaturationPerPath = new Array<number>(input.n_simulations).fill(0.05);

    for (let simIndex = 0; simIndex < input.n_simulations; simIndex += 1) {
      let currentRisk = 0.05;
      let maxSaturation = currentRisk;

      for (let step = 1; step < steps; step += 1) {
        const current = Math.max(currentRisk, 0);
        const drift = a * (b - current) * dt;
        const diffusion =
          sigmaAdjusted * Math.sqrt(current) * this.randomNormal() * Math.sqrt(dt);

        currentRisk = Math.max(current + drift + diffusion, 0);
        if (currentRisk > maxSaturation) {
          maxSaturation = currentRisk;
        }
      }

      maxSaturationPerPath[simIndex] = maxSaturation;
    }

    const meanSaturation = this.mean(maxSaturationPerPath);
    const stdSaturation = this.std(maxSaturationPerPath, meanSaturation);
    const riskProbability =
      maxSaturationPerPath.filter((value) => value > criticalThreshold).length /
      input.n_simulations;

    const alertLevel =
      riskProbability > 0.7 ? 'CRITICAL' :
      riskProbability > 0.4 ? 'HIGH' :
      riskProbability > 0.15 ? 'MEDIUM' :
      'LOW';

    const elapsed = Date.now() - startTime;
    logger.warn(
      {
        elapsed_ms: elapsed,
        n_simulations: input.n_simulations,
        risk_probability: riskProbability,
        alert_level: alertLevel,
      },
      'Using local CIR fallback engine'
    );

    return {
      risk_probability: Number(riskProbability.toFixed(4)),
      mean_saturation: Number(meanSaturation.toFixed(4)),
      std_saturation: Number(stdSaturation.toFixed(4)),
      alert_level: alertLevel,
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  private randomNormal(): number {
    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  private mean(values: readonly number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private std(values: readonly number[], mean: number): number {
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }
}
