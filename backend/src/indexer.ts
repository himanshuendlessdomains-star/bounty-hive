import { PrismaClient } from '@prisma/client';

// ─── Blockchain Indexer ──────────────────────────────────────────────────────
// Watches for bounty status transitions and auto-completes expired bounties

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '';
const POLL_INTERVAL = 10_000; // 10 seconds

export async function startIndexer(prisma: PrismaClient) {
  console.log('🔍 Starting blockchain indexer...');
  console.log(`   Factory: ${FACTORY_ADDRESS || 'not configured'}`);

  if (!FACTORY_ADDRESS) {
    console.log('⚠️  No FACTORY_ADDRESS set, indexer will not start');
    return;
  }

  // Main polling loop
  setInterval(async () => {
    try {
      await pollBountyEvents(prisma);
    } catch (err) {
      console.error('Indexer poll error:', err);
    }
  }, POLL_INTERVAL);

  // Initial poll
  await pollBountyEvents(prisma);
}

async function pollBountyEvents(prisma: PrismaClient) {
  // 1. Move active bounties past their end time to "review"
  const expiredBounties = await prisma.bounty.findMany({
    where: {
      status: 'active',
      endsAt: { lte: new Date() },
    },
  });

  for (const bounty of expiredBounties) {
    await prisma.bounty.update({
      where: { id: bounty.id },
      data: { status: 'review' },
    });
    console.log(`📋 Bounty ${bounty.id} moved to review status`);
  }

  // 2. Auto-complete review bounties past their review window
  const reviewExpired = await prisma.bounty.findMany({
    where: {
      status: 'review',
      reviewEndsAt: { lte: new Date() },
    },
  });

  for (const bounty of reviewExpired) {
    if (bounty.winnerSelection === 'draw') {
      const approvedSubmissions = await prisma.submission.findMany({
        where: { bountyId: bounty.id, status: 'approved' },
      });

      if (approvedSubmissions.length === 0) {
        await prisma.bounty.update({
          where: { id: bounty.id },
          data: { status: 'cancelled', completedAt: new Date() },
        });
        console.log(`💰 Bounty ${bounty.id} cancelled (no approved submissions)`);
      } else {
        const winnerCount = Math.min(bounty.winnerCount, approvedSubmissions.length);
        const shuffled = approvedSubmissions.sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, winnerCount);

        for (const winner of winners) {
          await prisma.winner.create({
            data: {
              bountyId: bounty.id,
              userId: winner.userId,
              payoutAmount: bounty.perWinnerAmount,
            },
          });
        }

        await prisma.bounty.update({
          where: { id: bounty.id },
          data: { status: 'completed', completedAt: new Date() },
        });
        console.log(`🏆 Bounty ${bounty.id} auto-completed with ${winners.length} winners`);
      }
    } else {
      // Manual: if owner didn't pick winners, auto-select approved submissions
      const approvedSubmissions = await prisma.submission.findMany({
        where: { bountyId: bounty.id, status: 'approved' },
      });

      if (approvedSubmissions.length === 0) {
        await prisma.bounty.update({
          where: { id: bounty.id },
          data: { status: 'cancelled', completedAt: new Date() },
        });
        console.log(`💰 Bounty ${bounty.id} cancelled (manual timeout, no submissions)`);
      } else {
        const winners = approvedSubmissions.slice(0, bounty.winnerCount);
        for (const winner of winners) {
          await prisma.winner.create({
            data: {
              bountyId: bounty.id,
              userId: winner.userId,
              payoutAmount: bounty.perWinnerAmount,
            },
          });
        }
        await prisma.bounty.update({
          where: { id: bounty.id },
          data: { status: 'completed', completedAt: new Date() },
        });
        console.log(`🏆 Bounty ${bounty.id} auto-completed (manual timeout, ${winners.length} winners)`);
      }
    }
  }

  // 3. Update TON prices for active bounties
  const activeBounties = await prisma.bounty.findMany({
    where: { status: { in: ['active', 'review'] } },
  });

  if (activeBounties.length > 0) {
    const tonPrice = await getTonPrice();
    if (tonPrice > 0) {
      for (const bounty of activeBounties) {
        await prisma.bounty.update({
          where: { id: bounty.id },
          data: {
            poolUsd: (parseFloat(bounty.poolAmount) * tonPrice).toFixed(2),
            perWinnerUsd: (parseFloat(bounty.perWinnerAmount) * tonPrice).toFixed(2),
          },
        });
      }
    }
  }
}

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
