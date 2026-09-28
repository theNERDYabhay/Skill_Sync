import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // JSON and form parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Structured request logging & request ID tracking
  app.use((req, res, next) => {
    const reqId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    res.setHeader('X-Request-Id', reqId);
    const start = Date.now();
    res.on('finish', () => {
      if (req.path.startsWith('/api')) {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms (id: ${reqId})`);
      }
    });
    next();
  });

  // Mount API endpoints under /api/v1 and /api
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // Vite development middleware or static production serving
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillSync] Production-Ready Platform live at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SkillSync] Fatal server error:', err);
  process.exit(1);
});
