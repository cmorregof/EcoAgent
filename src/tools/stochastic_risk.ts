import { BaseTool } from './index.js';
import { getStochasticRisk } from '../services/stochasticRisk.js';

export const getStochasticRiskTool: BaseTool = {
    name: 'get_stochastic_risk',
    description: 'OBTENER RIESGO REAL: Calcula el riesgo de deslizamiento en Manizales usando una simulación estocástica de Euler-Maruyama basada en datos climáticos reales de Open-Meteo. Usa esto siempre que pregunten por el clima o seguridad en Manizales.',
    parameters: {
        type: 'object',
        properties: {},
        required: []
    },
    execute: async () => {
        try {
            const result = await getStochasticRisk();
            return JSON.stringify(result, null, 2);
        } catch (error: any) {
            return `Error calculando riesgo: ${error.message}`;
        }
    }
};
