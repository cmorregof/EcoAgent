import { climateDb } from '../config/firebase-climate.js';
import { bot } from '../bot/index.js';
import { config } from '../config/index.js';

const TEMP_MAX = 30;
const TEMP_MIN = 5;
const ALERT_INTERVAL_MS = 10 * 60 * 1000; // Cada 10 minutos para no saturar

let lastAlertedProjectId: string | null = null;

export const startWeatherAlertService = () => {
  console.log('[Alert Service] Iniciando servicio de alertas climáticas...');
  
  setInterval(async () => {
    try {
      const snapshot = await climateDb.collection('projects')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return;

      const doc = snapshot.docs[0];
      const project = doc.data();
      
      // Solo notificar si es un proyecto nuevo o si no hemos notificado sobre este
      if (lastAlertedProjectId === doc.id) return;

      const stations = project.stations || [];
      const alerts = stations.filter((s: any) => s.temperature > TEMP_MAX || s.temperature < TEMP_MIN);

      if (alerts.length > 0) {
        let alertMessage = `⚠️ *¡ALERTA CLIMÁTICA DETECTADA!* ⚠️\n\n`;
        alertMessage += `Proyecto: ${project.name}\n\n`;
        
        alerts.forEach((s: any) => {
          const icon = s.temperature > TEMP_MAX ? '🔥' : '❄️';
          alertMessage += `${icon} *${s.name}*: ${s.temperature}°C\n`;
        });

        alertMessage += `\nRevisa el dashboard para más detalles.`;

        // Enviar a todos los usuarios permitidos
        for (const userId of config.telegram.allowedUserIds) {
          try {
            await bot.api.sendMessage(userId, alertMessage, { parse_mode: 'Markdown' });
          } catch (sendError) {
            console.error(`[Alert Service] Error enviando alerta a ${userId}:`, sendError);
          }
        }
        
        lastAlertedProjectId = doc.id;
        console.log(`[Alert Service] Alerta enviada para el proyecto: ${project.name}`);
      } else {
        // Marcar como procesado aunque no haya alertas para no repetir el chequeo
        lastAlertedProjectId = doc.id;
      }

    } catch (error) {
      console.error('[Alert Service] Error en el ciclo de alertas:', error);
    }
  }, ALERT_INTERVAL_MS);
};
