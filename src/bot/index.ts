import { Bot, Context, InputFile } from 'grammy';
import { hydrateFiles, FileFlavor } from '@grammyjs/files';
import { config } from '../config/index.js';
import { processUserMessage, transcribeAudio, generateSpeech } from '../agent/index.js';
import fs from 'fs/promises';

export type MyContext = FileFlavor<Context>;
export const bot = new Bot<MyContext>(config.telegram.token);
bot.api.config.use(hydrateFiles(bot.token));

// Middleware de seguridad restrictivo: Whitelist de ID exacto
bot.use(async (ctx, next) => {
    if (!ctx.from) return;
    
    if (config.telegram.allowedUserIds.includes(ctx.from.id)) {
        await next();
    } else {
        console.warn(`[Seguridad] Acceso bloqueado. ID: ${ctx.from.id} (@${ctx.from.username || 'N/A'}) intentó usar el bot.`);
    }
});

bot.command('start', async (ctx) => {
    await ctx.reply("¡Hola! Soy OpenGravity, tu agente personal e independiente. Sistemas operativos.");
});

import { GoogleAuthManager } from '../tools/google_auth.js';

bot.command('google_login', async (ctx) => {
    const url = GoogleAuthManager.getAuthUrl();
    await ctx.reply(`Para conectar tu cuenta de Google, visita el siguiente enlace, autoriza la aplicación y envíame el código que recibas:\n\n${url}`);
});

bot.command('google_token', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const text = ctx.message?.text || '';
    const code = text.replace('/google_token', '').trim().replace(/\s/g, '');

    if (!code) {
        await ctx.reply("Por favor, envía el código después del comando. Ejemplo: /google_token 4/P7q7W...");
        return;
    }

    try {
        await ctx.replyWithChatAction('typing');
        await GoogleAuthManager.exchangeCodeForTokens(userId, code);
        await ctx.reply("¡Conexión con Google establecida con éxito! Ahora puedo consultar tus correos, calendario y archivos.");
    } catch (e: any) {
        console.error(`[Google Auth Error]`, e);
        await ctx.reply(`Error al procesar el código de Google:\n${e.message}`);
    }
});

import { climateDb } from '../config/firebase-climate.js';

bot.command('clima', async (ctx) => {
    try {
        await ctx.replyWithChatAction('typing');
        
        // Consultar el último proyecto
        const snapshot = await climateDb.collection('projects')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            await ctx.reply("No se encontraron proyectos de clima en la base de datos.");
            return;
        }

        const project = snapshot.docs[0].data();
        const { name, stations, insights } = project;

        let response = `🌍 *Proyecto:* ${name}\n\n`;
        response += `🌡️ *Temperaturas:*\n`;
        
        if (stations && Array.isArray(stations)) {
            stations.forEach((s: any) => {
                response += `- ${s.name}: ${s.temperature}°C\n`;
            });
        } else {
            response += `(No hay datos de estaciones)\n`;
        }

        response += `\n🧠 *Análisis (Gemini):*\n${insights || 'Sin insights disponibles.'}`;

        // Función rudimentaria para limpiar markdown que Telegram odia
        const cleanResponse = response.replace(/\*\*/g, '*').replace(/#/g, '');

        // Enviar respuesta (usando Markdown para el formato)
        try {
            await ctx.reply(cleanResponse, { parse_mode: 'Markdown' });
        } catch (markdownError) {
             console.warn("Error enviando con Markdown, reintentando sin parse_mode:", markdownError);
             await ctx.reply(cleanResponse); // Fallback sin formato si Telegram lo rechaza
        }

    } catch (e: any) {
        console.error(`[Bot Error Clima]`, e);
        await ctx.reply(`Error al consultar el dashboard de clima:\n${e.message}`);
    }
});

import { getStochasticRisk } from '../services/stochasticRisk.js';

bot.command('riesgo', async (ctx) => {
    try {
        await ctx.replyWithChatAction('typing');
        
        const result = await getStochasticRisk();
        const { max_risk_index, risk_level, input_data } = result;

        let icon = '🟢';
        if (risk_level === 'CRÍTICO') icon = '🔴';
        else if (risk_level === 'MODERADO') icon = '🟡';

        let response = `🎲 *Simulación Estocástica (Euler-Maruyama)*\n`;
        response += `📍 *Ubicación:* Manizales, Caldas\n\n`;
        response += `📊 *Datos de Entrada (Meteo):*\n`;
        response += `- Temp: ${input_data.temp}°C\n`;
        response += `- Humedad: ${input_data.hum}%\n`;
        response += `- Precipitación: ${input_data.precip}mm\n\n`;
        response += `📉 *Resultado de Riesgo:* ${icon} *${risk_level}*\n`;
        response += `📈 *Índice de Saturación Máx:* \`${max_risk_index.toFixed(4)}\`\n\n`;
        
        if (risk_level === 'CRÍTICO') {
            response += `⚠️ *¡ALERTA!* Se detecta alta inestabilidad en la simulación. Se sugiere monitoreo constante.`;
        } else {
            response += `Todo parece bajo control según la proyección estocástica.`;
        }

        await ctx.reply(response, { parse_mode: 'Markdown' });

    } catch (e: any) {
        console.error(`[Bot Error Riesgo]`, e);
        await ctx.reply(`❌ *Error en el Motor SDE:*\n${e.message}`, { parse_mode: 'Markdown' });
    }
});

bot.command('audiodime', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    // Extraer el texto quitando el propio comando /audiodime
    const textCommand = ctx.message?.text || '';
    const query = textCommand.replace('/audiodime', '').trim();
    
    if (!query) {
        await ctx.reply("Escribe algo luego de /audiodime para que yo te responda en audio.");
        return;
    }

    try {
        await ctx.replyWithChatAction('record_voice');
        // Usamos el agente para razonar la respuesta primero
        const replyText = await processUserMessage(userId, query);
        
        // Convertimos esa inteligencia artificial a voz
        const audioBuffer = await generateSpeech(replyText);
        
        // Lo enviamos como audios
        await ctx.replyWithVoice(new InputFile(audioBuffer, 'respuesta.mp3'));
    } catch (e: any) {
        console.error(`[Bot Error AudioDime]`, e);
        await ctx.reply(`Ha ocurrido un error al procesar la síntesis de voz:\n${e.message}`);
    }
});

bot.on('message:text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    try {
        await ctx.replyWithChatAction('typing');
        const replyText = await processUserMessage(userId, text);
        
        // Telegram limita mensajes a 4096 caracteres
        // Se puede añadir lógica futura de 'chunks' aquí si las rptas son gigantes.
        await ctx.reply(replyText);
    } catch (e: any) {
        console.error(`[Bot Error]`, e);
        await ctx.reply(`Ha ocurrido un error inesperado al procesar el mensaje:\n${e.message}`);
    }
});
bot.on(['message:voice', 'message:audio'], async (ctx) => {
    const userId = ctx.from.id;

    try {
        await ctx.replyWithChatAction('typing');
        
        const file = await ctx.getFile();
        if (!file.file_path) {
            await ctx.reply("No pude acceder al archivo de audio.");
            return;
        }

        const tempFilePathRaw = await file.download();
        const tempFilePath = `${tempFilePathRaw}.ogg`;
        
        // Renombrar para asegurar extension .ogg y que Groq lo procese
        await fs.rename(tempFilePathRaw, tempFilePath);

        // Transcribir el audio a texto usando Groq
        const textFromAudio = await transcribeAudio(tempFilePath);

        // Limpiar el servidor (asegura que funciona en cualquier nube de bajo almacenamiento)
        try {
            await fs.unlink(tempFilePath);
        } catch (e) {
            console.error("[Bot Error] Fallo al limpiar archivo temporal:", e);
        }

        if (!textFromAudio || textFromAudio.trim() === '') {
            await ctx.reply("No pude entender el audio o estaba vacío.");
            return;
        }

        // Eco pequeño para feedback visual
        await ctx.reply(`🎙️ _"${textFromAudio}"_`, { parse_mode: 'Markdown' });

        // Procesar la transcripción como si el usuario lo hubiera escrito
        await ctx.replyWithChatAction('record_voice');
        const replyText = await processUserMessage(userId, textFromAudio);
        
        try {
            // Ya que el usuario nos mandó nota de voz, le devolvemos en voz también
            const audioBuffer = await generateSpeech(replyText);
            await ctx.replyWithVoice(new InputFile(audioBuffer, 'respuesta.mp3'));
        } catch (speechError) {
             // Si ElevenLabs falla por límite de tokens o algo, hacemos fallback a escribirle texto
             console.warn("Fallo en ElevenLabs, haciendo fallback a texto:", speechError);
             await ctx.reply(replyText);
        }

    } catch (e: any) {
        console.error(`[Bot Error Audio]`, e);
        await ctx.reply(`Ha ocurrido un error al procesar el audio:\n${e.message}`);
    }
});

export const startBot = async () => {
    console.log("[Bot] Iniciando servidor de long-polling de OpenGravity...");
    bot.start({
        onStart: (botInfo) => {
            console.log(`[Bot] Conectado exitosamente en Telegram como @${botInfo.username}`);
        }
    });
};
