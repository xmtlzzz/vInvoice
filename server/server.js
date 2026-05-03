import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { applyRoutes } from './routes.js';
import { seedIfEmpty } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Seed DB with initial data from JSON files if empty (idempotent)
seedIfEmpty().catch(e => console.error('Seed error:', e));
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [`http://localhost:${PORT}`, 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // On Vercel, frontend and API share the same origin, allow all
    if (process.env.VERCEL || !origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint for debugging
app.get('/api/health', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: 'DATABASE_URL not set', hasUrl: false });
    }
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    const result = await sql`SELECT COUNT(*) AS cnt FROM namespaces`;
    res.json({
      ok: true,
      hasUrl: true,
      urlPrefix: dbUrl.split('@')[1]?.split('/')[0] || '(unknown)',
      namespaceCount: Number(result[0]?.cnt),
    });
  } catch (e) {
    res.status(500).json({ error: e.message, hasUrl: !!process.env.DATABASE_URL });
  }
});

// API routes
applyRoutes(app);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  res.status(err.status || 500).json({ error: '服务器内部错误' });
});

// Vercel: export app for serverless; local: listen on port
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
