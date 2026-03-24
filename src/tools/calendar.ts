import { google } from 'googleapis';
import { BaseTool } from './index.js';
import { GoogleAuthManager } from './google_auth.js';

export const listCalendarEventsTool: BaseTool = {
    name: 'list_calendar_events',
    description: 'Lista los próximos eventos del calendario de Google del usuario.',
    parameters: {
        type: 'object',
        properties: {
            maxResults: {
                type: 'number',
                description: 'Número máximo de eventos a listar (por defecto 5).',
            },
        },
    },
    execute: async ({ userId, maxResults = 5 }: { userId: number; maxResults?: number }) => {
        try {
            const auth = await GoogleAuthManager.getClient(userId);
            const calendar = google.calendar({ version: 'v3', auth });

            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = res.data.items || [];
            if (events.length === 0) {
                return 'No tienes eventos próximos programados.';
            }

            let result = 'Tus próximos eventos:\n';
            events.forEach((event) => {
                const start = event.start?.dateTime || event.start?.date;
                result += `- ${start}: ${event.summary}\n`;
            });

            return result;
        } catch (error: any) {
            return `Error al listar eventos: ${error.message}`;
        }
    },
};
