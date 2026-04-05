// ---
// 📚 POR QUÉ: Middleware de autenticación que reemplaza la lista estática de IDs.
//    Cada mensaje pasa por aquí primero. Busca la sesión del usuario en el repositorio;
//    si no existe, le pide que se registre. Sin esto, cualquier persona podría usar
//    el bot sin restricción, o peor, el bot crashearía al no encontrar un session.
// 📁 ARCHIVO: src/interfaces/telegram/middleware/authMiddleware.ts
// ---

import type { Context, NextFunction } from 'grammy';
import type { ISessionRepository } from '../../../infrastructure/session/SessionRepository.js';
import type { UserSession } from '../../../domain/models/UserSession.js';
import { logger } from '../../../config/logger.js';

/**
 * Extended Grammy context with user session attached by middleware.
 */
export interface EcoAgentContext extends Context {
  session?: UserSession;
}

/**
 * Creates an auth middleware that loads (or creates) a user session
 * for every incoming message.
 *
 * Currently uses TELEGRAM_ALLOWED_USER_IDS as a transitional guard.
 * Once Supabase auth is fully integrated, this will check against
 * the users table instead.
 */
export function createAuthMiddleware(
  sessionRepo: ISessionRepository,
  allowedUserIds: readonly number[]
): (ctx: EcoAgentContext, next: NextFunction) => Promise<void> {
  return async (ctx: EcoAgentContext, next: NextFunction): Promise<void> => {
    if (!ctx.from) return;

    const chatId = ctx.chat?.id?.toString();
    if (!chatId) return;
    const userId = ctx.from.id.toString();

    // 1. Always allow /start and /ayuda (onboarding commands)
    const command = ctx.message?.text?.split(' ')[0];
    const isPublicCommand = command === '/start' || command === '/ayuda';

    if (isPublicCommand) {
      try {
        const session = await sessionRepo.getOrCreate(chatId, userId);
        ctx.session = session;
        await next();
      } catch (err) {
        logger.error({ err, chatId }, 'Failed to load public session');
      }
      return;
    }

    // 2. Multi-tier Authorization Check
    const isWhitelisted = allowedUserIds.length > 0 && allowedUserIds.includes(ctx.from.id);
    const isLinked = await sessionRepo.isUserLinked(chatId);

    if (!isWhitelisted && !isLinked) {
      logger.warn(
        { userId, username: ctx.from.username },
        'Unauthorized access attempt blocked'
      );
      await ctx.reply(
        'Para usar EcoAgent, regístrate en la plataforma web y vincula tu cuenta de Telegram.'
      );
      return;
    }

    try {
      // Load or create user session
      const session = await sessionRepo.getOrCreate(chatId, userId);
      ctx.session = session;
      await next();
    } catch (err: unknown) {
      logger.error({ err, chatId }, 'Failed to load user session');
      await ctx.reply('Error interno al cargar tu sesión. Intenta de nuevo.');
    }
  };
}
