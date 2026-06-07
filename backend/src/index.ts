import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import bountyRoutes from './routes/bounties';
import submissionRoutes from './routes/submissions';
import userRoutes from './routes/users';
import webhookRoutes from './routes/webhooks';
import { telegramAuth } from './middleware/auth';
import { rateLimit } from './middleware/rateLimit';
import { errorHandler, notFound } from './middleware/errorHandler';
import { startIndexer } from './indexer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// ALLOWED_ORIGINS: comma-separated list of origins, or "*" to allow all.
// Defaults to localhost:5173 for development.
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

const ALLOW_ALL = ALLOWED_ORIGINS.includes('*');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header)
      if (!origin) return callback(null, true);
      // Wildcard mode
      if (ALLOW_ALL) return callback(null, true);
      // Check against allowlist
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      // Origin not in allowlist — reject the request gracefully (no throw)
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit);

// ─── Public routes ────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/webhooks', webhookRoutes);

// ─── Authenticated routes ─────────────────────────────────────────────────────

app.use('/api', telegramAuth);
app.use('/api/bounties', bountyRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);

// ─── Error handling ────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🏴‍☠️ BountyHive API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
  console.log(`   CORS: ${ALLOW_ALL ? 'allow all' : ALLOWED_ORIGINS.join(', ')}`);
});

startIndexer(prisma).catch(console.error);

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };
