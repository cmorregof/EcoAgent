import axios from 'axios';
import { config } from '../config/index.js';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast?latitude=5.0689&longitude=-75.5174&daily=weather_code&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,apparent_temperature,uv_index,is_day,shortwave_radiation&timezone=auto';

// Usar variable de entorno o fallback a localhost para el motor Python
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000/simulate_risk';

export interface RiskResult {
    max_risk_index: number;
    risk_level: string;
    input_data: {
        temp: number;
        precip: number;
        hum: number;
    };
}

export async function getStochasticRisk(): Promise<RiskResult> {
    try {
        console.log(`[Stochastic Service] Consultando Open-Meteo para Manizales...`);
        const meteoResponse = await axios.get(OPEN_METEO_URL);
        const data = meteoResponse.data;

        // Extraer primeros valores horarios de la rpta
        const currentTemperature = data.hourly.temperature_2m[0];
        const currentHumidity = data.hourly.relative_humidity_2m[0];
        const currentPrecipitation = data.hourly.precipitation[0];

        console.log(`[Stochastic Service] Enviando a Python Engine (SDE)...`);
        const payload = {
            temperature: currentTemperature,
            precipitation: currentPrecipitation,
            humidity: currentHumidity
        };

        const pythonResponse = await axios.post(PYTHON_API_URL, payload);
        return pythonResponse.data;
    } catch (error: any) {
        console.error(`[Stochastic Service] Error:`, error.message);
        throw new Error('No se pudo calcular el riesgo estocástico en este momento. Asegúrate de que el motor de Python esté encendido.');
    }
}
