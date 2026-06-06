import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ─── GET /api/users/:id — Get user profile ────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { bounties: true, submissions: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id/bounties — Get user's bounties ────────────────────────

router.get('/:id/bounties', async (req, res) => {
  try {
    const { status } = req.query;
    const where: any = { ownerId: req.params.id };
    if (status) where.status = status;

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bounties });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id/submissions — Get user's submissions ──────────────────

router.get('/:id/submissions', async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.params.id },
      include: {
        bounty: {
          select: { id: true, title: true, poolAmount: true, status: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/users — Create or update user from Telegram auth ───────────────

router.post('/', async (req, res) => {
  try {
    const { telegramId, tonAddress, username, displayName, avatarUrl } = req.body;

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { tonAddress, username, displayName, avatarUrl },
      create: { telegramId, tonAddress, username, displayName, avatarUrl },
    });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
