// ---
// 📚 POR QUÉ: Define errores tipados para el motor de simulación en lugar de strings genéricos.
//    Sin clases de error propias, un catch solo tiene "Error" — no puedes distinguir si el
//    servicio está caído (retry con backoff), si el response es inválido (bug en Python),
//    o si estás siendo rate-limited (esperar). Cada tipo requiere una estrategia distinta.
// 📁 ARCHIVO: src/infrastructure/simulation/errors.ts
// ---

/**
 * Thrown when the Python simulation engine is unreachable (ECONNREFUSED, timeout).
 * Recovery strategy: retry with exponential backoff, alert ops.
 */
export class SimulationServiceUnavailableError extends Error {
  public override readonly name = 'SimulationServiceUnavailableError';

  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
  }
}

/**
 * Thrown when the simulation engine returns a response that doesn't match
 * the expected Zod schema. Indicates a contract mismatch between TS and Python.
 * Recovery strategy: fix the Python engine or update the schema.
 */
export class SimulationValidationError extends Error {
  public override readonly name = 'SimulationValidationError';

  constructor(
    message: string,
    public readonly zodErrors?: unknown
  ) {
    super(message);
  }
}

/**
 * Thrown when the simulation engine returns HTTP 429 (Too Many Requests).
 * Recovery strategy: wait and retry after the indicated backoff period.
 */
export class SimulationRateLimitError extends Error {
  public override readonly name = 'SimulationRateLimitError';

  constructor(
    message: string,
    public readonly retryAfterMs?: number
  ) {
    super(message);
  }
}
