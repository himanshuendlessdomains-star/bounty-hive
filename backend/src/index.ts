import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bountyRoutes from './routes/bounties';
import submissionRoutes from './routes/submissions';
import userRoutes from './routes/users';
import webhookRoutes from './routes/webhooks';
import { startIndexer } from './indexer';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Telegram WebApp auth middleware
app.use('/api', (req, res, next) => {
  // In production, validate Telegram initData
  // const initData = req.headers['x-telegram-init-data'];
  // Validate with Bot token
  next();
});

// Routes
app.use('/api/bounties', bountyRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏴‍☠️ BountyHive API running on port ${PORT}`);
});

// Start blockchain indexer
startIndexer(prisma).catch(console.error);

export { app, prisma };
