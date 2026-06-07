import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── GET /api/bounties ────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [bounties, total] = await Promise.all([
      prisma.bounty.findMany({
        where,
        include: {
          owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.bounty.count({ where }),
    ]);

    res.json({
      bounties: bounties.map(({ _count, ...b }) => ({ ...b, submissionCount: _count.submissions })),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/bounties/:id ────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const bounty = await prisma.bounty.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        submissions: {
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
          orderBy: { submittedAt: 'desc' },
        },
        winners: {
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
        },
      },
    });

    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
    res.json(bounty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/bounties ───────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const callerId = req.user?.id;
    if (!callerId) return res.status(401).json({ error: 'Authentication required' });

    const { title, description, type, poolAmount, winnerCount, winnerSelection, verification, verificationRule, escrowAddress } = req.body;

    if (!title || !description || !type || !poolAmount || !winnerCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tonPrice = await getTonPrice();
    const perWinner = parseFloat(poolAmount) / Number(winnerCount);
    const perWinnerUsd = perWinner * tonPrice;
    if (tonPrice > 0 && perWinnerUsd < 0.01) {
      return res.status(400).json({ error: `Per-winner payout ($${perWinnerUsd.toFixed(4)}) below minimum $0.01` });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const reviewEndsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);

    const bounty = await prisma.bounty.create({
      data: {
        title,
        description,
        type,
        poolAmount,
        poolUsd: tonPrice > 0 ? (parseFloat(poolAmount) * tonPrice).toFixed(2) : '0',
        winnerCount: Number(winnerCount),
        perWinnerAmount: perWinner.toFixed(6),
        perWinnerUsd: tonPrice > 0 ? perWinnerUsd.toFixed(2) : '0',
        winnerSelection,
        verification,
        verificationRule: verificationRule || '',
        escrowAddress,
        ownerId: callerId,
        status: 'active',
        endsAt,
        reviewEndsAt,
      },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        submissions: true,
        winners: true,
      },
    });

    res.status(201).json(bounty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/bounties/:id ──────────────────────────────────────────────────

router.patch('/:id', async (req, res) => {
  try {
    const callerId = req.user?.id;
    if (!callerId) return res.status(401).json({ error: 'Authentication required' });

    const bounty = await prisma.bounty.findUnique({ where: { id: req.params.id } });
    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
    if (bounty.ownerId !== callerId) return res.status(403).json({ error: 'Forbidden' });

    const { status } = req.body;
    const updated = await prisma.bounty.update({
      where: { id: req.params.id },
      data: { status, completedAt: status === 'completed' ? new Date() : undefined },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getTonPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
    const data = await res.json();
    return data['the-open-network']?.usd ?? 0;
  } catch {
    return 0;
  }
}

export default router;
