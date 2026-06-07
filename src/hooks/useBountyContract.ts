import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { useBountyStore } from '../stores/bountyStore';
import { api, mapBounty } from '../api/client';
import { CreateBountyPayload } from '../types/bounty';

export function useBountyContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        // Mock: create via API (which returns mock data)
        // Duration is always 24h — the API client defaults it
        const backendBounty = await api.createBounty({
          title: payload.title,
          description: payload.description,
          type: payload.type,
          poolAmount: payload.poolAmount,
          winnerCount: payload.winnerCount,
          winnerSelection: payload.winnerSelection,
          verification: payload.verification,
          verificationRule: payload.verificationRule,
        });

        addBounty(mapBounty(backendBounty));
        return backendBounty;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create bounty';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, addBounty]
  );

  return { createBounty, loading, error };
}
