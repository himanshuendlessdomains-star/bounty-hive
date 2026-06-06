import { Address, Cell, beginCell, toNano, fromNano } from 'ton-core';
import { getTonConnectUI } from './tonConnect';

// ─── Escrow Contract Interface ──────────────────────────────────────────────

// Opcodes
const SUBMIT_PROOF_OPCODE = 0x10;
const APPROVE_SUBMISSION_OPCODE = 0x11;
const REJECT_SUBMISSION_OPCODE = 0x12;
const SELECT_WINNERS_OPCODE = 0x13;
const CANCEL_BOUNTY_OPCODE = 0x14;
const AUTO_COMPLETE_OPCODE = 0x15;

/**
 * Submit proof to a bounty escrow
 */
export async function submitProof(
  escrowAddress: string,
  proofUrl: string
): Promise<string> {
  const ui = getTonConnectUI();

  const body = beginCell()
    .storeUint(SUBMIT_PROOF_OPCODE, 32)
    .storeRef(
      beginCell()
        .storeStringTail(proofUrl)
        .endCell()
    )
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: escrowAddress,
        amount: toNano('0.05').toString(), // gas for submission
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

/**
 * Approve a submission (owner only)
 */
export async function approveSubmission(
  escrowAddress: string,
  submissionId: number
): Promise<string> {
  const ui = getTonConnectUI();

  const body = beginCell()
    .storeUint(APPROVE_SUBMISSION_OPCODE, 32)
    .storeUint(submissionId, 64)
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: escrowAddress,
        amount: toNano('0.03').toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

/**
 * Reject a submission (owner only)
 */
export async function rejectSubmission(
  escrowAddress: string,
  submissionId: number
): Promise<string> {
  const ui = getTonConnectUI();

  const body = beginCell()
    .storeUint(REJECT_SUBMISSION_OPCODE, 32)
    .storeUint(submissionId, 64)
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: escrowAddress,
        amount: toNano('0.03').toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

/**
 * Select winners manually (owner only)
 */
export async function selectWinners(
  escrowAddress: string,
  winnerAddresses: string[]
): Promise<string> {
  const ui = getTonConnectUI();

  // Build winner map cell
  let winnersCell = beginCell();
  for (let i = 0; i < winnerAddresses.length; i++) {
    winnersCell.storeUint(i, 16);
    winnersCell.storeAddress(Address.parse(winnerAddresses[i]));
  }

  const body = beginCell()
    .storeUint(SELECT_WINNERS_OPCODE, 32)
    .storeRef(winnersCell.endCell())
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: escrowAddress,
        amount: toNano('0.1').toString(), // higher gas for multi-payout
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

/**
 * Cancel an active bounty (owner only)
 */
export async function cancelBounty(escrowAddress: string): Promise<string> {
  const ui = getTonConnectUI();

  const body = beginCell()
    .storeUint(CANCEL_BOUNTY_OPCODE, 32)
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: escrowAddress,
        amount: toNano('0.03').toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

/**
 * Trigger auto-complete after review window
 */
export async function triggerAutoComplete(escrowAddress: string): Promise<string> {
  const ui = getTonConnectUI();

  const body = beginCell()
    .storeUint(AUTO_COMPLETE_OPCODE, 32)
    .endCell();

  const result = await ui.sendTransaction({
    messages: [
      {
        address: escrowAddress,
        amount: toNano('0.1').toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}
