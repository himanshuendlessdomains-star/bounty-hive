import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── POST /api/submissions ────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const callerId = req.user?.id;
    if (!callerId) return res.status(401).json({ error: 'Authentication required' });

    const { bountyId, proofUrl } = req.body;
    if (!bountyId || !proofUrl) return res.status(400).json({ error: 'Missing bountyId or proofUrl' });

    const bounty = await prisma.bounty.findUnique({ where: { id: bountyId } });
    if (!bounty) return res.status(404).json({ error: 'Bounty not found' });
    if (bounty.status !== 'active') return res.status(400).json({ error: 'Bounty is not active' });
    if (new Date() > bounty.endsAt) return res.status(400).json({ error: 'Bounty has ended' });

    const existing = await prisma.submission.findFirst({ where: { bountyId, userId: callerId } });
    if (existing) return res.status(400).json({ error: 'Already submitted' });

    const submission = await prisma.submission.create({
      data: { bountyId, userId: callerId, proofUrl, status: 'pending' },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });

    res.status(201).json(submission);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/submissions/:id ───────────────────────────────────────────────

router.patch('/:id', async (req, res) => {
  try {
    const callerId = req.user?.id;
    if (!callerId) return res.status(401).json({ error: 'Authentication required' });

    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { bounty: { select: { ownerId: true } } },
    });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.bounty.ownerId !== callerId) return res.status(403).json({ error: 'Forbidden' });

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }

    const updated = await prisma.submission.update({
      where: { id: req.params.id },
      data: { status, reviewedAt: new Date() },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
