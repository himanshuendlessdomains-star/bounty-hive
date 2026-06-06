import { Address, Cell, beginCell, toNano } from '@ton/core';
import { getTonConnectUI } from './tonConnect';

const SUBMIT_PROOF_OPCODE = 0x10;
const APPROVE_SUBMISSION_OPCODE = 0x11;
const REJECT_SUBMISSION_OPCODE = 0x12;
const SELECT_WINNERS_OPCODE = 0x13;
const CANCEL_BOUNTY_OPCODE = 0x14;
const AUTO_COMPLETE_OPCODE = 0x15;

export class BountyEscrow {
  static buildSubmitProofMessage(proofUrl: string): Cell {
    return beginCell()
      .storeUint(SUBMIT_PROOF_OPCODE, 32)
      .storeRef(beginCell().storeStringTail(proofUrl).endCell())
      .endCell();
  }

  static buildApproveMessage(submissionId: string): Cell {
    return beginCell()
      .storeUint(APPROVE_SUBMISSION_OPCODE, 32)
      .storeStringTail(submissionId)
      .endCell();
  }

  static buildRejectMessage(submissionId: string): Cell {
    return beginCell()
      .storeUint(REJECT_SUBMISSION_OPCODE, 32)
      .storeStringTail(submissionId)
      .endCell();
  }

  static buildCancelMessage(): Cell {
    return beginCell()
      .storeUint(CANCEL_BOUNTY_OPCODE, 32)
      .endCell();
  }

  static buildSelectWinnersMessage(winnerAddresses: string[]): Cell {
    let winnersCell = beginCell();
    for (let i = 0; i < winnerAddresses.length; i++) {
      winnersCell = winnersCell
        .storeUint(i, 16)
        .storeAddress(Address.parse(winnerAddresses[i]));
    }
    return beginCell()
      .storeUint(SELECT_WINNERS_OPCODE, 32)
      .storeRef(winnersCell.endCell())
      .endCell();
  }

  static buildAutoCompleteMessage(): Cell {
    return beginCell()
      .storeUint(AUTO_COMPLETE_OPCODE, 32)
      .endCell();
  }
}

export async function submitProof(escrowAddress: string, proofUrl: string): Promise<string> {
  const ui = getTonConnectUI();
  const body = BountyEscrow.buildSubmitProofMessage(proofUrl);
  const result = await ui.sendTransaction({
    messages: [{ address: escrowAddress, amount: toNano('0.05').toString(), payload: body.toBoc().toString('base64') }],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });
  return result.boc;
}

export async function approveSubmission(escrowAddress: string, submissionId: number): Promise<string> {
  const ui = getTonConnectUI();
  const body = BountyEscrow.buildApproveMessage(String(submissionId));
  const result = await ui.sendTransaction({
    messages: [{ address: escrowAddress, amount: toNano('0.03').toString(), payload: body.toBoc().toString('base64') }],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });
  return result.boc;
}

export async function rejectSubmission(escrowAddress: string, submissionId: number): Promise<string> {
  const ui = getTonConnectUI();
  const body = BountyEscrow.buildRejectMessage(String(submissionId));
  const result = await ui.sendTransaction({
    messages: [{ address: escrowAddress, amount: toNano('0.03').toString(), payload: body.toBoc().toString('base64') }],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });
  return result.boc;
}

export async function selectWinners(escrowAddress: string, winnerAddresses: string[]): Promise<string> {
  const ui = getTonConnectUI();
  const body = BountyEscrow.buildSelectWinnersMessage(winnerAddresses);
  const result = await ui.sendTransaction({
    messages: [{ address: escrowAddress, amount: toNano('0.1').toString(), payload: body.toBoc().toString('base64') }],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });
  return result.boc;
}

export async function cancelBounty(escrowAddress: string): Promise<string> {
  const ui = getTonConnectUI();
  const body = BountyEscrow.buildCancelMessage();
  const result = await ui.sendTransaction({
    messages: [{ address: escrowAddress, amount: toNano('0.03').toString(), payload: body.toBoc().toString('base64') }],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });
  return result.boc;
}

export async function triggerAutoComplete(escrowAddress: string): Promise<string> {
  const ui = getTonConnectUI();
  const body = BountyEscrow.buildAutoCompleteMessage();
  const result = await ui.sendTransaction({
    messages: [{ address: escrowAddress, amount: toNano('0.1').toString(), payload: body.toBoc().toString('base64') }],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });
  return result.boc;
}
