// ---
// 📚 POR QUÉ: Define el contrato para síntesis de voz como servicio opcional.
//    El diseño clave: retorna null en lugar de lanzar excepciones.
//    Sin esto, un error de ElevenLabs (rate limit, timeout) bloquearía la respuesta
//    de texto al usuario. La voz es un "nice-to-have", no debe romper el flujo principal.
// 📁 ARCHIVO: src/domain/ports/IVoiceService.ts
// ---

export interface VoiceOptions {
  readonly voice_id?: string;
  readonly stability?: number;
  readonly similarity_boost?: number;
}

export interface IVoiceService {
  /**
   * Converts text to speech audio.
   *
   * CRITICAL CONTRACT: Returns null if the service is unavailable — NEVER throws.
   * This ensures the text response is always delivered to the user regardless
   * of voice service health. Errors are logged internally.
   */
  synthesize(text: string, options?: VoiceOptions): Promise<Buffer | null>;
}
