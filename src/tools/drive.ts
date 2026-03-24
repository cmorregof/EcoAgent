import { google } from 'googleapis';
import { BaseTool } from './index.js';
import { GoogleAuthManager } from './google_auth.js';

export const listDriveFilesTool: BaseTool = {
    name: 'list_drive_files',
    description: 'Lista los archivos recientes en Google Drive del usuario.',
    parameters: {
        type: 'object',
        properties: {
            pageSize: {
                type: 'number',
                description: 'Número de archivos a listar (por defecto 5).',
            },
        },
    },
    execute: async ({ userId, pageSize = 5 }: { userId: number; pageSize?: number }) => {
        try {
            const auth = await GoogleAuthManager.getClient(userId);
            const drive = google.drive({ version: 'v3', auth });

            const res = await drive.files.list({
                pageSize: pageSize,
                fields: 'nextPageToken, files(id, name, mimeType)',
                orderBy: 'modifiedTime desc',
            });

            const files = res.data.files || [];
            if (files.length === 0) {
                return 'No se encontraron archivos en tu Google Drive.';
            }

            let result = 'Tus archivos recientes de Drive:\n';
            files.forEach((file) => {
                result += `- ${file.name} (${file.mimeType})\n`;
            });

            return result;
        } catch (error: any) {
            return `Error al listar archivos de Drive: ${error.message}`;
        }
    },
};
