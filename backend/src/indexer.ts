import { TonClient, Address, fromNano, toNano } from '@ton/ton';
import { prisma } from './lib/prisma';

// ─── TON Indexer ──────────────────────────────────────────────────────────────
// Periodically checks escrow contracts for state changes and records payouts.
// Runs alongside the API server.

const TON_NETWORK = process.env.TON_NETWORK || 'mainnet';
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY || '';
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || '';

const TON_ENDPOINT = TON_NETWORK === 'mainnet'
  ? 'https://toncenter.com/api/v2/'
  : 'https://testnet.toncenter.com/api/v2/';

const POLL_INTERVAL = 30_000; // 30 seconds

function createTonClient(): TonClient {
  const headers: Record<string, string> = {};
  if (TONCENTER_API_KEY) headers['X-API-Key'] = TONCENTER_API_KEY;
  return new TonClient({
    endpoint: TON_ENDPOINT,
    options: { headers },
  });
}

async function processBounty(bounty: { id: string; escrowAddress: string | null; status: string; poolAmount: string }) {
  if (!bounty.escrowAddress) return;

  try {
    const client = createTonClient();
    const addr = Address.parse(bounty.escrowAddress);

    // Check if contract is still active
    const state = await client.getContractState(addr);
    if (state.state !== 'active') return;

    // Read escrow state
    const result = await client.runMethod(addr, 'get_bounty_state');
    const reader = result.stack;

    const onChainStatus = reader.readString();
    const payoutDone = reader.readBoolean();

    // Update bounty status if changed on-chain
    if (onChainStatus !== bounty.status) {
      await prisma.bounty.update({
        where: { id: bounty.id },
        data: { status: onChainStatus },
      });
      console.log(`[indexer] Bounty ${bounty.id} status: ${bounty.status} → ${onChainStatus}`);
    }

    // If payout is done on-chain, mark winners as paid
    if (payoutDone) {
      const unpaidWinners = await prisma.winner.findMany({
        where: { bountyId: bounty.id, payoutTxHash: null },
      });

      if (unpaidWinners.length > 0) {
        // Check recent transactions to the winner addresses for payout hashes
        for (const winner of unpaidWinners) {
          // In production, you'd look up the actual tx hash from the blockchain
          // For now, mark as paid with a placeholder
          await prisma.winner.update({
            where: { id: winner.id },
            data: {
              paidAt: new Date(),
              payoutTxHash: `escrow:${bounty.escrowAddress}`,
            },
          });
        }
        console.log(`[indexer] Marked ${unpaidWinners.length} winners as paid for bounty ${bounty.id}`);
      }
    }
  } catch (err) {
    // Contract might not be deployed yet or network issue — skip silently
    console.warn(`[indexer] Error checking escrow ${bounty.escrowAddress}:`, err instanceof Error ? err.message : err);
  }
}

export async function startIndexer() {
  if (!FACTORY_ADDRESS) {
    console.log('⏭️  Indexer skipped: FACTORY_ADDRESS not set');
    return;
  }

  console.log(`🔍 Starting TON indexer (${TON_NETWORK})...`);
  console.log(`   Factory: ${FACTORY_ADDRESS}`);
  console.log(`   Poll interval: ${POLL_INTERVAL / 1000}s`);

  async function tick() {
    try {
      // Get all active/review bounties with escrow addresses
      const bounties = await prisma.bounty.findMany({
        where: {
          escrowAddress: { not: null },
          status: { in: ['active', 'review'] },
        },
      });

      for (const bounty of bounties) {
        await processBounty(bounty);
      }
    } catch (err) {
      console.error('[indexer] Tick error:', err);
    }
  }

  // Initial tick
  await tick();

  // Schedule periodic ticks
  setInterval(tick, POLL_INTERVAL);
}
