import { google } from 'googleapis';
import { BaseTool } from './index.js';
import { GoogleAuthManager } from './google_auth.js';

export const listGmailMessagesTool: BaseTool = {
    name: 'list_gmail_messages',
    description: 'Lista los correos electrónicos más recientes del usuario en Gmail.',
    parameters: {
        type: 'object',
        properties: {
            maxResults: {
                type: 'number',
                description: 'Número máximo de correos a listar (por defecto 5).',
            },
        },
    },
    execute: async ({ userId, maxResults = 5 }: { userId: number; maxResults?: number }) => {
        console.log(`[Herramienta: list_gmail_messages] Solicitada por usuario ${userId}`);
        try {
            const auth = await GoogleAuthManager.getClient(userId);
            const gmail = google.gmail({ version: 'v1', auth });

            const res = await gmail.users.messages.list({
                userId: 'me',
                maxResults: maxResults,
                q: 'label:INBOX',
            });

            const messages = res.data.messages || [];
            if (messages.length === 0) {
                return 'No se encontraron correos recientes.';
            }

            let result = 'Tus correos recientes:\n';
            for (const msg of messages) {
                const details = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                });
                const snippet = details.data.snippet;
                const subjectHeader = details.data.payload?.headers?.find(h => h.name === 'Subject');
                const subject = subjectHeader ? subjectHeader.value : '(Sin asunto)';
                result += `- **${subject}**: ${snippet}\n`;
            }

            return result;
        } catch (error: any) {
            return `Error al listar correos: ${error.message}`;
        }
    },
};
