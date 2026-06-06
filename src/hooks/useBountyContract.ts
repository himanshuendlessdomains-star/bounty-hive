import { useState, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano, Cell } from '@ton/core';
import { BountyFactory } from '../contracts/BountyFactory';
import { ADDRESSES } from '../contracts/addresses';
import { useBountyStore } from '../stores/bountyStore';
import { useWalletStore } from '../stores/walletStore';
import { CreateBountyPayload } from '../types/bounty';
import { api } from '../api/client';

export function useBountyContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();
  const { addBounty } = useBountyStore();
  const { address: walletAddress } = useWalletStore();

  const createBounty = useCallback(
    async (payload: CreateBountyPayload) => {
      if (!walletAddress) {
        setError('Wallet not connected');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Create bounty in backend
        const backendBounty = await api.createBounty({
          ...payload,
          ownerId: walletAddress,
        });

        // 2. Deploy escrow contract via TON Connect
        const factoryAddress = Address.parse(ADDRESSES.testnet.factoryAddress);
        const factory = new BountyFactory(factoryAddress);

        const poolAmountNano = toNano(payload.poolAmount);
        const feeAmountNano = toNano((parseFloat(payload.poolAmount) * 0.01).toFixed(4)); // 1% fee
        const totalAmount = poolAmountNano + feeAmountNano + toNano('0.1'); // + gas

        const body = BountyFactory.buildCreateBountyMessage({
          title: payload.title,
          description: payload.description,
          bountyType: payload.type,
          poolAmount: poolAmountNano,
          winnerCount: payload.winnerCount,
          winnerSelection: payload.winnerSelection,
          verification: payload.verification,
          ownerAddress: Address.parse(walletAddress),
        });

        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: factoryAddress.toString(),
              amount: totalAmount.toString(),
              payload: body.toBoc().toString('base64'),
            },
          ],
        });

        // 3. Update backend with escrow address (will be set by indexer)
        addBounty({
          id: backendBounty.id,
          title: backendBounty.title,
          description: backendBounty.description,
          type: backendBounty.type as any,
          poolAmount: backendBounty.poolAmount,
          poolUsd: backendBounty.poolUsd,
          winnerCount: backendBounty.winnerCount,
          perWinnerAmount: backendBounty.perWinnerAmount,
          perWinnerUsd: backendBounty.perWinnerUsd,
          winnerSelection: backendBounty.winnerSelection as any,
          verification: backendBounty.verification as any,
          verificationRule: backendBounty.verificationRule,
          status: backendBounty.status as any,
          ownerId: backendBounty.ownerId,
          submissions: [],
          endsAt: new Date(backendBounty.endsAt).getTime(),
          escrowAddress: backendBounty.escrowAddress ?? undefined,
        });

        return backendBounty;
      } catch (err: any) {
        setError(err.message || 'Failed to create bounty');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, tonConnectUI, addBounty]
  );

  return { createBounty, loading, error };
}
