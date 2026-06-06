import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '';
const POLL_INTERVAL = 10_000;

export async function startIndexer(prisma: PrismaClient) {
  console.log('🔍 Starting blockchain indexer...');

  if (!FACTORY_ADDRESS) {
    console.log('⚠️  No FACTORY_ADDRESS set, indexer will not start');
    return;
  }

  setInterval(async () => {
    try { await pollBountyEvents(prisma); } catch (err) { console.error('Indexer poll error:', err); }
  }, POLL_INTERVAL);

  await pollBountyEvents(prisma);
}

function cryptoShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function pollBountyEvents(prisma: PrismaClient) {
  // Fetch TON price once per poll cycle
  const tonPrice = await getTonPrice();

  // 1. Move expired active bounties to review
  const expiredActive = await prisma.bounty.findMany({
    where: { status: 'active', endsAt: { lte: new Date() } },
  });
  for (const bounty of expiredActive) {
    await prisma.bounty.update({ where: { id: bounty.id }, data: { status: 'review' } });
    console.log(`📋 Bounty ${bounty.id} → review`);
  }

  // 2. Auto-complete review bounties past their review window
  const reviewExpired = await prisma.bounty.findMany({
    where: { status: 'review', reviewEndsAt: { lte: new Date() } },
  });
  for (const bounty of reviewExpired) {
    const approved = await prisma.submission.findMany({
      where: { bountyId: bounty.id, status: 'approved' },
    });

    if (approved.length === 0) {
      await prisma.bounty.update({
        where: { id: bounty.id },
        data: { status: 'cancelled', completedAt: new Date() },
      });
      console.log(`💰 Bounty ${bounty.id} cancelled (no approved submissions)`);
      continue;
    }

    const pool = bounty.winnerSelection === 'draw' ? cryptoShuffle(approved) : approved;
    const winners = pool.slice(0, Math.min(bounty.winnerCount, approved.length));

    for (const w of winners) {
      await prisma.winner.create({
        data: { bountyId: bounty.id, userId: w.userId, payoutAmount: bounty.perWinnerAmount },
      });
    }
    await prisma.bounty.update({
      where: { id: bounty.id },
      data: { status: 'completed', completedAt: new Date() },
    });
    console.log(`🏆 Bounty ${bounty.id} completed with ${winners.length} winners`);
  }

  // 3. Update USD prices for active/review bounties
  if (tonPrice > 0) {
    const active = await prisma.bounty.findMany({
      where: { status: { in: ['active', 'review'] } },
    });
    for (const bounty of active) {
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

async function getTonPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
    const data = await res.json();
    return data['the-open-network']?.usd ?? 0;
  } catch {
    return 0;
  }
}
