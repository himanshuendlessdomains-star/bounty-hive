import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── GET /api/users/:id ───────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bounties: true, submissions: true } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id/bounties ──────────────────────────────────────────────

router.get('/:id/bounties', async (req, res) => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { ownerId: req.params.id };
    if (status) where.status = status;

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bounties: bounties.map(({ _count, ...b }) => ({ ...b, submissionCount: _count.submissions })) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/:id/submissions ───────────────────────────────────────────

router.get('/:id/submissions', async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.params.id },
      include: {
        bounty: { select: { id: true, title: true, poolAmount: true, status: true } },
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/users — upsert from Telegram or TON address ───────────────────

router.post('/', async (req, res) => {
  try {
    const callerId = req.user?.id;
    if (!callerId) return res.status(401).json({ error: 'Authentication required' });

    const { telegramId, tonAddress, username, displayName, avatarUrl } = req.body;

    // Telegram users: upsert by telegramId
    if (telegramId) {
      const user = await prisma.user.upsert({
        where: { telegramId },
        update: { tonAddress, username, displayName, avatarUrl },
        create: { telegramId, tonAddress, username, displayName, avatarUrl },
      });
      return res.json(user);
    }

    // Chrome/TON users: upsert by tonAddress
    if (tonAddress) {
      const user = await prisma.user.upsert({
        where: { tonAddress },
        update: { username, displayName, avatarUrl },
        create: { tonAddress, username, displayName, avatarUrl },
      });
      return res.json(user);
    }

    // If neither, return the authenticated user
    const user = await prisma.user.findUnique({ where: { id: callerId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
