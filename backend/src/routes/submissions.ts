import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ─── POST /api/submissions — Submit proof ─────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { bountyId, userId, proofUrl } = req.body;

    // Check bounty is active and not expired
    const bounty = await prisma.bounty.findUnique({ where: { id: bountyId } });
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }
    if (bounty.status !== 'active') {
      return res.status(400).json({ error: 'Bounty is not active' });
    }
    if (new Date() > bounty.endsAt) {
      return res.status(400).json({ error: 'Bounty has ended' });
    }

    // Check for duplicate submission
    const existing = await prisma.submission.findFirst({
      where: { bountyId, userId },
    });
    if (existing) {
      return res.status(400).json({ error: 'Already submitted' });
    }

    const submission = await prisma.submission.create({
      data: {
        bountyId,
        userId,
        proofUrl,
        status: 'pending',
      },
    });

    res.status(201).json(submission);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/submissions/:id — Approve or reject ──────────────────────────

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewedAt: new Date(),
      },
    });

    res.json(submission);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
