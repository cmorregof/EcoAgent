import OpenAI from 'openai';
import { config } from '../config/index.js';
import { memory, ContextMessage } from '../memory/index.js';
import { getToolsForLLM, executeTool } from '../tools/index.js';

const groqClient = new OpenAI({
    apiKey: config.ai.groqApiKey,
    baseURL: 'https://api.groq.com/openai/v1',
});

const openRouterClient = new OpenAI({
    apiKey: config.ai.openRouterApiKey,
    baseURL: 'https://openrouter.ai/api/v1',
});

const SYSTEM_PROMPT = `Eres OpenGravity, un asistente personal de inteligencia artificial avanzado y seguro. 
Te comunicas en español de forma natural, amigable y muy expresiva, haciendo uso frecuente de EMOTICONOS (emojis) 🚀.
IMPORTANTE: Cuando el usuario pregunte por riesgos climáticos o deslizamientos en Manizales:
1. DEBES usar la herramienta 'get_stochastic_risk'.
2. La respuesta debe ser estructurada y visual:
   - Usa un encabezado claro como "🎲 Simulación Estocástica Euler-Maruyama".
   - Indica el "Nivel de Riesgo: [BAJO/MODERADO/CRÍTICO]" con un emoji de color (🟢/🟡/🔴).
   - Explica brevemente qué estamos haciendo (simulando inestabilidad basada en datos de Open-Meteo).
3. Eres un asistente MULTIMODAL. Tus respuestas de texto se convertirán en voz. NUNCA digas que no puedes enviar audio; redacta tu respuesta con entusiasmo y el sistema se encargará.`;

const MAX_ITERATIONS = 5;
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'; // Modelo gratuito/rápido de Groq

async function callLLM(messages: ContextMessage[], tools: any[]) {
    const primaryModel = config.ai.openRouterModel || 'openai/gpt-4o-mini';
    try {
        console.log(`[Agente] Llamando a OpenRouter (${primaryModel})...`);
        const response = await openRouterClient.chat.completions.create({
            model: primaryModel,
            messages: messages as any[],
            tools: tools.length > 0 ? tools : undefined,
            tool_choice: tools.length > 0 ? "auto" : "none",
        });
        return response.choices[0].message;
    } catch (error: any) {
        console.warn(`[Agente] Fallo en OpenRouter: ${error.message}. Intentando Fallback a Groq...`);
        const response = await groqClient.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: messages as any[],
            tools: tools.length > 0 ? tools : undefined,
            tool_choice: tools.length > 0 ? "auto" : "none",
        });
        return response.choices[0].message;
    }
}

import fs from 'fs';

export async function transcribeAudio(filePath: string): Promise<string> {
    console.log(`[Agente] Transcribiendo audio usando Groq Whisper...`);
    try {
        const transcription = await groqClient.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: "whisper-large-v3",
          response_format: "json",
          language: "es" // Opcional, fuerza reconocimiento rápido en español
        });
        return transcription.text;
    } catch (error: any) {
        console.error(`[Agente] Error transcribiendo audio: ${error.message}`);
        throw new Error('No se pudo transcribir el audio en este momento.');
    }
}

import { ElevenLabsClient } from "elevenlabs";

const elevenLabsClient = new ElevenLabsClient({
  apiKey: config.ai.elevenlabsApiKey,
});

export async function generateSpeech(text: string): Promise<Buffer> {
    console.log(`[Agente] Generando audio con ElevenLabs (Voz: ${config.ai.elevenlabsVoiceId})...`);
    try {
        const audioStream = await elevenLabsClient.textToSpeech.convert(config.ai.elevenlabsVoiceId, {
            output_format: "mp3_44100_128",
            text: text,
            model_id: "eleven_multilingual_v2"
        });

        const chunks: Buffer[] = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);
    } catch (error: any) {
        console.error(`[Agente] Error generando síntesis de voz: ${error.message}`);
        throw new Error('No se pudo generar el audio de respuesta.');
    }
}

export async function processUserMessage(userId: number, text: string): Promise<string> {
    // 1. Añadir el mensaje del usuario al historial
    await memory.addMessage(userId, { role: 'user', content: text });

    // 2. Preparar el contexto completo temporal
    const history = await memory.getHistory(userId);
    const context: ContextMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history
    ];

    const tools = getToolsForLLM();
    let iter = 0;

    // 3. Agent Loop
    while (iter < MAX_ITERATIONS) {
        iter++;
        
        const message = await callLLM(context, tools);

        console.log(`[Agente] Iteración ${iter} - Respuesta:`, message.content || '(Llamada a herramienta)');

        // Añadir la respuesta temporal del modelo
        const assistantMessage: ContextMessage = {
            role: 'assistant',
            content: message.content || null,
            tool_calls: message.tool_calls as any[]
        };
        context.push(assistantMessage);
        
        // Persistirlo en memoria de largo plazo
        await memory.addMessage(userId, assistantMessage);

        // 4. Comprobar si hay llamadas a herramientas
        if (message.tool_calls && message.tool_calls.length > 0) {
            for (const toolCall of message.tool_calls) {
                const funcName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments || '{}');
                
                console.log(`[Herramienta] Llamando ejecutador de: ${funcName}`);
                const result = await executeTool(funcName, { ...args, userId });
                
                const toolResultMessage: ContextMessage = {
                    role: 'tool',
                    content: result,
                    tool_call_id: toolCall.id,
                    name: funcName
                };
                
                context.push(toolResultMessage);
                await memory.addMessage(userId, toolResultMessage); // Guardar respuesta de herramienta
            }
            // Realizar siguiente vuelta en el while (iterar)
        } else {
            // El LLM ha emitido una respuesta de texto directo al usuario
            return message.content || '...';
        }
    }

    return "He llegado al límite máximo de procesamiento interno para tu mensaje.";
}
