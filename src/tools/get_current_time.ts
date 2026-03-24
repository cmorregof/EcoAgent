import { BaseTool } from './index.js';

export const getCurrentTimeTool: BaseTool = {
    name: 'get_current_time',
    description: 'Obtiene la fecha y hora actual del sistema. Útil para responder sobre cuándo ocurrió un evento, qué día es hoy, o qué hora es.',
    parameters: {
        type: 'object',
        properties: {},
        required: []
    },
    execute: () => {
        const now = new Date();
        return now.toLocaleString('es-ES', { timeZoneName: 'short' });
    }
};
