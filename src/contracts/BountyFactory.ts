import { Address, Cell, beginCell } from '@ton/core';

const CREATE_BOUNTY_OPCODE = 0x1;

export class BountyFactory {
  static buildCreateBountyMessage(params: {
    title: string;
    description: string;
    bountyType: string;
    poolAmount: bigint;
    winnerCount: number;
    winnerSelection: string;
    verification: string;
    ownerAddress: Address;
  }): Cell {
    return beginCell()
      .storeUint(CREATE_BOUNTY_OPCODE, 32)
      .storeRef(
        beginCell()
          .storeStringTail(params.title)
          .storeStringTail(params.description)
          .storeStringTail(params.bountyType)
          .storeUint(params.winnerCount, 16)
          .storeStringTail(params.winnerSelection)
          .storeStringTail(params.verification)
          .storeAddress(params.ownerAddress)
          .endCell()
      )
      .endCell();
  }
}
