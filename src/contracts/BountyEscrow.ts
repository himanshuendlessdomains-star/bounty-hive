import { Address, Cell, beginCell } from '@ton/core';

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
      .storeUint(winnerAddresses.length, 32)
      .storeRef(winnersCell.endCell())
      .endCell();
  }

  static buildAutoCompleteMessage(): Cell {
    return beginCell()
      .storeUint(AUTO_COMPLETE_OPCODE, 32)
      .endCell();
  }
}
