import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ─── GET /api/bounties — List active bounties ────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.bounty.count({ where });

    res.json({
      bounties: bounties.map((b) => ({
        ...b,
        submissionCount: b._count.submissions,
        _count: undefined,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/bounties/:id — Get bounty detail ──────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const bounty = await prisma.bounty.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        submissions: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
        winners: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }

    res.json(bounty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/bounties — Create a new bounty ────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      poolAmount,
      winnerCount,
      winnerSelection,
      verification,
      verificationRule,
      escrowAddress,
      ownerId,
    } = req.body;

    // Validate minimum payout ($0.01)
    const tonPrice = await getTonPrice();
    const perWinner = parseFloat(poolAmount) / winnerCount;
    const perWinnerUsd = perWinner * tonPrice;
    if (perWinnerUsd < 0.01) {
      return res.status(400).json({
        error: `Per-winner payout ($${perWinnerUsd.toFixed(4)}) below minimum $0.01`,
      });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
    const reviewEndsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000); // +24h review

    const bounty = await prisma.bounty.create({
      data: {
        title,
        description,
        type,
        poolAmount,
        poolUsd: (parseFloat(poolAmount) * tonPrice).toFixed(2),
        winnerCount,
        perWinnerAmount: perWinner.toFixed(6),
        perWinnerUsd: perWinnerUsd.toFixed(2),
        winnerSelection,
        verification,
        verificationRule: verificationRule || '',
        escrowAddress,
        ownerId,
        status: 'active',
        endsAt,
        reviewEndsAt,
      },
    });

    res.status(201).json(bounty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/bounties/:id — Update bounty status ─────────────────────────

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const bounty = await prisma.bounty.update({
      where: { id: req.params.id },
      data: { status, completedAt: status === 'completed' ? new Date() : undefined },
    });
    res.json(bounty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Helper: Fetch TON price ──────────────────────────────────────────────────

async function getTonPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd'
    );
    const data = await res.json();
    return data['the-open-network']?.usd ?? 0;
  } catch {
    return 0;
  }
}

export default router;
