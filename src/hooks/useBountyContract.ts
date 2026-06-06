import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { createBounty } from '../contracts/BountyFactory';
import type { CreateBountyPayload } from '../types/bounty';

export function useBountyContract() {
  const { isConnected } = useWalletStore();
  const [isCreating, setIsCreating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createNewBounty = useCallback(async (payload: CreateBountyPayload) => {
    if (!isConnected) {
      setError('Wallet not connected');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const boc = await createBounty({
        title: payload.title,
        description: payload.description,
        bountyType: payload.type,
        poolAmount: payload.poolAmount,
        winnerCount: payload.winnerCount,
        winnerSelection: payload.winnerSelection,
        verification: payload.verification,
        verificationRule: payload.verificationRule ?? '',
      });

      setTxHash(boc);
      return boc;
    } catch (err: any) {
      setError(err.message || 'Failed to create bounty');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [isConnected]);

  return { createNewBounty, isCreating, txHash, error };
}
