// ---
// 📚 POR QUÉ: Reemplaza todos los console.log/console.error con un logger estructurado.
//    En producción, los logs JSON son parseables por herramientas como Railway, Datadog, etc.
//    En desarrollo, pino-pretty los formatea legibles. Sin esto, los logs son texto plano
//    sin timestamps, niveles ni contexto — imposibles de filtrar o buscar.
// 📁 ARCHIVO: src/config/logger.ts
// ---

import pino from 'pino';
import { settings } from './settings.js';

const transport =
  settings.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined; // In production: raw JSON to stdout (default pino behavior)

/**
 * Singleton structured logger for the entire application.
 * - Development: human-readable via pino-pretty
 * - Production: JSON lines for log aggregation services
 */
export const logger: pino.Logger = pino({
  level: settings.NODE_ENV === 'development' ? 'debug' : 'info',
  base: {
    service: 'ecoagent-bot',
    version: process.env['npm_package_version'] ?? '0.0.0',
  },
  transport,
});
