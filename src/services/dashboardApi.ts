import { createServer } from 'http';
import { climateDb } from '../config/firebase-climate.js';

export const startDashboardApi = () => {
  const PORT = 3000;
  
  const server = createServer(async (req, res) => {
    // Basic CORS support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/api/climate/latest' && req.method === 'GET') {
      try {
        const snapshot = await climateDb.collection('projects')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (snapshot.empty) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No projects found' }));
          return;
        }

        const project = snapshot.docs[0].data();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(project));
      } catch (error: any) {
        console.error('[API Error]', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(`[Dashboard API] Servidor de API local escuchando en http://localhost:${PORT}`);
  });
};
