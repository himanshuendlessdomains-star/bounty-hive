import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { useBountyStore } from '../stores/bountyStore';
import { api, mapBounty } from '../api/client';
import { CreateBountyPayload } from '../types/bounty';

// ─── Mock mode: no real contract calls ────────────────────────────────────────
const USE_MOCK = !import.meta.env.VITE_API_URL;

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
        // Create bounty via API (mock or real)
        const backendBounty = await api.createBounty({
          ...payload,
        });

        if (USE_MOCK) {
          // Mock mode: skip contract deployment, just return the API result
          addBounty(mapBounty(backendBounty));
          return backendBounty;
        }

        // Real mode: deploy escrow contract via TON Connect
        // This will be implemented when smart contracts are ready
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
