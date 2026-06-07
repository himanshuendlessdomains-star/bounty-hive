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
        const backendBounty = await api.createBounty({
          ...payload,
          ownerId: walletAddress,
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
    [walletAddress, addBounty]
  );

  return { createBounty, loading, error };
}
