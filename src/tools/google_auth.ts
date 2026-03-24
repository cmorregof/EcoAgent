import { google } from 'googleapis';
import admin from 'firebase-admin';
import { config } from '../config/index.js';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export class GoogleAuthManager {
    private static oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUri
    );

    static getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent',
        });
    }

    static async exchangeCodeForTokens(userId: number, code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        await this.saveTokens(userId, tokens);
        return tokens;
    }

    private static async saveTokens(userId: number, tokens: any) {
        const db = admin.firestore();
        await db.collection('users').doc(userId.toString()).set({
            googleTokens: tokens,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }

    static async getClient(userId: number) {
        const db = admin.firestore();
        const doc = await db.collection('users').doc(userId.toString()).get();
        const data = doc.data();

        if (!data || !data.googleTokens) {
            throw new Error('Usuario no autenticado con Google. Usa /google_login.');
        }

        const client = new google.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            config.google.redirectUri
        );

        client.setCredentials(data.googleTokens);

        // Manejar refresco de token automáticamente
        client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                // Si hay un nuevo refresh token, lo guardamos
                this.saveTokens(userId, { ...data.googleTokens, ...tokens });
            } else {
                // Si solo se refrescó el access token
                this.saveTokens(userId, { ...data.googleTokens, ...tokens });
            }
        });

        return client;
    }
}
