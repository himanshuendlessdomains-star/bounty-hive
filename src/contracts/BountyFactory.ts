import { Address, Cell, beginCell, toNano, fromNano } from 'ton-core';
import { getTonConnectUI } from './tonConnect';
import { getFactoryAddress } from './addresses';

// ─── Factory Contract Interface ──────────────────────────────────────────────

// Opcodes for BountyFactory messages
const CREATE_BOUNTY_OPCODE = 0x1;

/**
 * Create a new bounty via the BountyFactory contract
 */
export async function createBounty(params: {
  title: string;
  description: string;
  bountyType: string;
  poolAmount: string; // TON amount (e.g. "1")
  winnerCount: number;
  winnerSelection: string;
  verification: string;
  verificationRule: string;
}): Promise<string> {
  const ui = getTonConnectUI();
  const factoryAddress = getFactoryAddress();

  // Build the CreateBounty message body
  const body = beginCell()
    .storeUint(CREATE_BOUNTY_OPCODE, 32)
    .storeRef(
      beginCell()
        .storeStringTail(params.title)
        .storeStringTail(params.description)
        .storeStringTail(params.bountyType)
        .storeUint(params.winnerCount, 16)
        .storeStringTail(params.winnerSelection)
        .storeStringTail(params.verification)
        .storeStringTail(params.verificationRule)
        .endCell()
    )
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: factoryAddress,
        amount: toNano(params.poolAmount).toString(), // pool amount + gas
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

/**
 * Get all bounty escrow addresses from the factory
 */
export async function getBountyAddresses(): Promise<string[]> {
  // This would typically call a backend API that indexes the blockchain
  // For now, we'll use the backend API
  const response = await fetch('/api/bounties');
  const data = await response.json();
  return data.bounties.map((b: any) => b.escrowAddress);
}
