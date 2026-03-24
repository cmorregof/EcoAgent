import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CLIMATE_DB_ID = 'ai-studio-c86cd8e9-90a1-4326-86f1-5d3e946204d0';
const SERVICE_ACCOUNT_PATH = resolve(process.cwd(), 'service-account-climate.json');

import { getFirestore } from 'firebase-admin/firestore';

let climateApp: admin.app.App;

try {
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  
  // Inicializar app secundaria
  climateApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }, 'climateApp');

  console.log('✓ Firebase Climate App inicializada con éxito.');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Climate App:', error);
  throw error;
}

// Exportar la base de datos específica
export const climateDb = getFirestore(climateApp, CLIMATE_DB_ID);
export { climateApp };
