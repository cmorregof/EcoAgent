import type OpenAI from 'openai';
import { settings } from '../config/settings.js';
import type { ISessionRepository } from '../infrastructure/session/SessionRepository.js';
import { logger } from '../config/logger.js';

export class ModelExplanationUseCase {
  constructor(
    private readonly openai: OpenAI,
    private readonly sessionRepo: ISessionRepository
  ) {}

  async explainModel(chatId: string): Promise<string> {
    const userSettings = await this.sessionRepo.getSettings(chatId);
    const lang = userSettings?.language || 'es';
    const isEn = lang === 'en';

    try {
      const systemPrompt = isEn
        ? `You are an expert Technical Mentor and Quantitative Researcher. 
           Your goal is to explain the Cox-Ingersoll-Ross (CIR) stochastic model used in this project in an organic, conversational, and authoritative way.
           
           TECHNICAL CONTEXT:
           - We model soil saturation risk (Rt) as a Square-Root Diffusion process (CIR).
           - SDE: dRt = a(b - Rt)dt + σ√Rt dWt
           - Implementation: We use Monte Carlo simulations (up to 10,000 paths) with the Euler-Maruyama discretization.
           - Dynamic Calibration: 
             - Parameter 'b' (long-term mean) increases by 0.05 per mm of rain.
             - Humidity adds up to 0.2 to the baseline risk.
             - Temperature reduces saturation due to evaporation.
           - Threshold: A path is considered "Critical" if saturation exceeds 0.6.
           
           INSTRUCTIONS:
           - Explain the theory and the code implementation organically.
           - Do not just list bullet points; talk to the user.
           - Mention that we choose CIR because it prevents negative saturation (mean reversion).
           - Respond in English.`
        : `Eres un Mentor Técnico experto e Investigador Cuantitativo. 
           Tu objetivo es explicar el modelo estocástico Cox-Ingersoll-Ross (CIR) usado en este proyecto de forma orgánica, conversacional y autoritaria.
           
           CONTEXTO TÉCNICO:
           - Modelamos el riesgo de saturación del suelo (Rt) como un proceso de difusión de raíz cuadrada (CIR).
           - Ecuación (SDE): dRt = a(b - Rt)dt + σ√Rt dWt.
           - Implementación: Usamos simulaciones Monte Carlo (hasta 10,000 trayectorias) con la discretización de Euler-Maruyama.
           - Calibración Dinámica: 
             - El parámetro 'b' (media de largo plazo) aumenta +0.05 por cada mm de lluvia.
             - La humedad suma hasta +0.2 al riesgo base.
             - La temperatura reduce la saturación por evaporación.
           - Umbral: Una trayectoria se considera "Crítica" si supera el nivel de 0.6.
           
           INSTRUCCIONES:
           - Explica la teoría y la implementación en el script de forma orgánica.
           - No hagas solo una lista; habla con el usuario como un mentor.
           - Menciona que elegimos CIR porque evita valores negativos (reversión a la media).
           - Responde en Español.`;

      const response = await this.openai.chat.completions.create({
        model: settings.OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: isEn ? 'Explain the model and why we use it.' : 'Explícame el modelo y por qué lo usamos.' }
        ],
        temperature: 0.7, // Higher temperature for more "organic" feel
      });

      return response.choices[0]?.message?.content?.trim() || 
        (isEn ? "I'm sorry, I cannot explain the model right now." : "Lo siento, no puedo explicar el modelo en este momento.");

    } catch (err) {
      logger.error({ err, chatId }, 'Error in ModelExplanationUseCase');
      return isEn ? "Error generating explanation." : "Error al generar la explicación técnica.";
    }
  }
}
