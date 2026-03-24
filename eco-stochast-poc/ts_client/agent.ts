import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del proyecto si existe
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast?latitude=5.0689&longitude=-75.5174&daily=weather_code&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,apparent_temperature,uv_index,is_day,shortwave_radiation&timezone=auto';
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000/simulate_risk';

async function runAgent() {
    console.log("🌦️ Iniciando Eco-Stochast Agent Protocol...\n");

    try {
        // 1. Obtener datos de Open-Meteo para Manizales
        console.log(`📡 Consultando API de Open-Meteo...`);
        const meteoResponse = await axios.get(OPEN_METEO_URL);
        const data = meteoResponse.data;

        // 2. Extraer el valor actual o el promedio
        // Para simplicidad en este PoC, tomaremos el primer valor horario reportado
        const currentTemperature = data.hourly.temperature_2m[0];
        const currentHumidity = data.hourly.relative_humidity_2m[0];
        const currentPrecipitation = data.hourly.precipitation[0];

        console.log(`📊 Datos extraídos:`);
        console.log(`   - Temperatura: ${currentTemperature}°C`);
        console.log(`   - Humedad: ${currentHumidity}%`);
        console.log(`   - Precipitación: ${currentPrecipitation}mm\n`);

        // 3. Enviar al backend Matemático Python
        console.log(`🧮 Enviando datos al motor de simulación SDE (Python API)...`);
        
        const payload = {
            temperature: currentTemperature,
            precipitation: currentPrecipitation,
            humidity: currentHumidity
        };

        const pythonResponse = await axios.post(PYTHON_API_URL, payload);
        const result = pythonResponse.data;

        // 4. Imprimir resultados (simulando input para Groq)
        console.log(`\n✅ Simulación completada con éxito.`);
        console.log(`\n=== OUTPUT PARA LLM (Generación de Alerta) ===`);
        console.log(`[Riesgo Simulado Euler-Maruyama]:`);
        console.log(JSON.stringify(result, null, 2));
        console.log(`=============================================\n`);
        
        console.log(`Este output será ingerido por OpenGravity para redactar la alerta final en Telegram/Voz.`);

    } catch (error: any) {
        console.error(`❌ Error en el proceso analítico:`, error.message);
        if (error.response) {
            console.error(error.response.data);
        }
    }
}

runAgent();
