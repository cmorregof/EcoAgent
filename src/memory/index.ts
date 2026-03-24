import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from '../config/index.js';

export interface ContextMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_call_id?: string;
    tool_calls?: any[];
    name?: string;
}

export interface DBMessage extends ContextMessage {
    timestamp: FirebaseFirestore.Timestamp;
}

// Inicializar Firebase (singleton)
const serviceAccountPath = resolve(process.cwd(), config.googleCredentials);
const serviceAccountRaw = readFileSync(serviceAccountPath, 'utf8');
const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

export const memory = {
    async addMessage(userId: number, message: ContextMessage) {
        try {
            const collectionRef = db.collection('users').doc(userId.toString()).collection('messages');
            
            // Añadir el mensaje con Firestore Timestamp
            await collectionRef.add({
                ...message,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error: any) {
            console.error(`[Memoria Firebase] Error guardando mensaje:`, error);
        }
    },
    
    async getHistory(userId: number, limit: number = 50): Promise<ContextMessage[]> {
        try {
            const collectionRef = db.collection('users').doc(userId.toString()).collection('messages');
            
            // Traer historial ordenado por fecha de creación ascendente
            const snapshot = await collectionRef
                .orderBy('timestamp', 'asc')
                .limitToLast(limit)
                .get();

            if (snapshot.empty) {
                return [];
            }

            const messages: ContextMessage[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                messages.push({
                    role: data.role,
                    content: data.content,
                    ...(data.tool_call_id ? { tool_call_id: data.tool_call_id } : {}),
                    ...(data.tool_calls ? { tool_calls: data.tool_calls } : {}),
                    ...(data.name ? { name: data.name } : {})
                });
            });

            return messages;
        } catch (error: any) {
            console.error(`[Memoria Firebase] Error al obtener el historial:`, error);
            return [];
        }
    },

    async clearHistory(userId: number) {
        try {
            const collectionRef = db.collection('users').doc(userId.toString()).collection('messages');
            const snapshot = await collectionRef.get();
            
            // Eliminar cada documento (Firebase no tiene TRUNCATE)
            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        } catch (error: any) {
             console.error(`[Memoria Firebase] Error borrando historial:`, error);
        }
    }
};
