import { useState, useCallback } from 'react';
import { useTonConnectUI, CHAIN } from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import { BountyFactory } from '../contracts/BountyFactory';
import { getFactoryAddress, IS_TESTNET } from '../contracts/addresses';
import { useBountyStore } from '../stores/bountyStore';
import { useWalletStore } from '../stores/walletStore';
import { CreateBountyPayload } from '../types/bounty';
import { api, mapBounty } from '../api/client';

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

      const factoryAddress = getFactoryAddress();
      if (!factoryAddress) {
        setError('Contract not deployed yet — factory address not configured');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Create record in backend first
        const backendBounty = await api.createBounty({ ...payload });

        // Deploy escrow contract via TON Connect
        const poolAmountNano = toNano(payload.poolAmount);
        const feeAmountNano = toNano((parseFloat(payload.poolAmount) * 0.01).toFixed(4));
        const totalAmount = poolAmountNano + feeAmountNano + toNano('0.1');

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
          network: IS_TESTNET ? CHAIN.TESTNET : CHAIN.MAINNET,
          messages: [
            {
              address: Address.parse(factoryAddress).toString(),
              amount: totalAmount.toString(),
              payload: body.toBoc().toString('base64'),
            },
          ],
        });

        addBounty(mapBounty(backendBounty));
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
