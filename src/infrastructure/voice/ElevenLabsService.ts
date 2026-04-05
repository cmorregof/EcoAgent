// ---
// 📚 POR QUÉ: Implementa IVoiceService con el contrato "nunca lanza excepciones".
//    ElevenLabs puede fallar por rate limits, créditos agotados, o timeout — pero la
//    respuesta de texto al usuario NUNCA debe bloquearse por un fallo de voz. El error se
//    loggea, se retorna null, y el bot continúa funcionando solo con texto.
// 📁 ARCHIVO: src/infrastructure/voice/ElevenLabsService.ts
// ---

import { ElevenLabsClient } from 'elevenlabs';
import type { IVoiceService, VoiceOptions } from '../../domain/ports/IVoiceService.js';
import { logger } from '../../config/logger.js';

export class ElevenLabsService implements IVoiceService {
  private readonly client: ElevenLabsClient;
  private readonly defaultVoiceId: string;

  constructor(apiKey: string, defaultVoiceId: string) {
    this.client = new ElevenLabsClient({ apiKey });
    this.defaultVoiceId = defaultVoiceId;
  }

  /**
   * Synthesizes text to speech. Returns null on ANY failure — never throws.
   */
  async synthesize(text: string, options?: VoiceOptions): Promise<Buffer | null> {
    try {
      const voiceId = options?.voice_id ?? this.defaultVoiceId;

      logger.debug({ voiceId, textLength: text.length }, 'Starting ElevenLabs synthesis');

      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        output_format: 'mp3_44100_128',
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarity_boost ?? 0.75,
        },
      });

      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      logger.info({ voiceId, audioBytes: buffer.length }, 'ElevenLabs synthesis completed');

      return buffer;
    } catch (err: unknown) {
      // CRITICAL: Log but NEVER re-throw. Voice is optional.
      logger.error(
        { err, textLength: text.length },
        'ElevenLabs synthesis failed — returning null, text response will continue'
      );
      return null;
    }
  }
}
