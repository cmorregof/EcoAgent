import { startBot } from './bot/index.js';
import { startWeatherAlertService } from './services/weatherAlerts.js';
import { initializeRemoteTools } from './tools/index.js';

process.on('unhandledRejection', (reason, promise) => {
    console.error('Rechazo de promesa no capturado en:', promise, 'razón:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error);
});

// Inicializar herramientas remotas (MCP)
await initializeRemoteTools();

// Arrancar Bot
startBot().catch(console.error);

// Arrancar Servicio de Alertas (Dashboard de Clima)
startWeatherAlertService();

// Arrancar API local para el Frontend Dashboard
import { startDashboardApi } from './services/dashboardApi.js';
startDashboardApi();
