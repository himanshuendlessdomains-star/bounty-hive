import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
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
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit);

// ─── Public routes (no auth) ─────────────────────────────────────────────────

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/webhooks', webhookRoutes);

// ─── Authenticated routes ─────────────────────────────────────────────────────

app.use('/api', telegramAuth); // Apply auth to all /api routes below

app.use('/api/bounties', bountyRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);

// ─── Error handling ──────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🏴‍☠️ BountyHive API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
});

// ─── Start blockchain indexer ─────────────────────────────────────────────────

startIndexer(prisma).catch(console.error);

// ─── Graceful shutdown ────────────────────────────────────────────────────────

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };
