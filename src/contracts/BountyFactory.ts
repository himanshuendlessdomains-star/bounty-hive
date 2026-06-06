import { Address, Cell, beginCell, toNano, fromNano } from '@ton/core';
import { getTonConnectUI } from './tonConnect';
import { getFactoryAddress } from './addresses';

const CREATE_BOUNTY_OPCODE = 0x1;

export class BountyFactory {
  constructor(private address: Address) {}

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

export async function createBounty(params: {
  title: string;
  description: string;
  bountyType: string;
  poolAmount: string;
  winnerCount: number;
  winnerSelection: string;
  verification: string;
  verificationRule: string;
}): Promise<string> {
  const ui = getTonConnectUI();
  const factoryAddress = getFactoryAddress();

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
        amount: toNano(params.poolAmount).toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 600,
  });

  return result.boc;
}

export async function getBountyAddresses(): Promise<string[]> {
  const response = await fetch('/api/bounties');
  const data = await response.json();
  return data.bounties.map((b: any) => b.escrowAddress);
}
