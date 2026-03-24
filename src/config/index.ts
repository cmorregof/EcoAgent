import dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env') });

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }
  return value;
};

// Parsear la whitelist de IDs separados por comas
const parseAllowedUserIds = (ids: string): number[] => {
  return ids.split(',').map(id => {
    const parsed = parseInt(id.trim(), 10);
    if (isNaN(parsed)) {
      throw new Error(`ID de usuario de Telegram inválido en la whitelist: ${id}`);
    }
    return parsed;
  });
};

export const config = {
  telegram: {
    token: requireEnv('TELEGRAM_BOT_TOKEN'),
    allowedUserIds: parseAllowedUserIds(requireEnv('TELEGRAM_ALLOWED_USER_IDS')),
  },
  ai: {
    groqApiKey: requireEnv('GROQ_API_KEY'),
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModel: process.env.OPENROUTER_MODEL || 'openrouter/free',
    elevenlabsApiKey: requireEnv('ELEVENLABS_API_KEY'),
    elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // Rachel Voice
  },
  dbPath: process.env.DB_PATH || './memory.db',
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json',
  google: {
    clientId: requireEnv('GOOGLE_CLIENT_ID'),
    clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob', // OOB para modo manual
  },
  mcp: {
    stitch: {
      url: process.env.GOOGLE_STITCH_MCP_URL || '',
      apiKey: process.env.GOOGLE_STITCH_MCP_API_KEY || '',
    }
  }
};
