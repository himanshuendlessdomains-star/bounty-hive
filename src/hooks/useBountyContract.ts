import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { useUserStore } from '../stores/userStore';
import { useBountyStore } from '../stores/bountyStore';
import { api, mapBounty } from '../api/client';
import { CreateBountyPayload } from '../types/bounty';

export function useBountyContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addBounty } = useBountyStore();
  const { address: walletAddress } = useWalletStore();
  const { userId, syncUser } = useUserStore();

  const createBounty = useCallback(
    async (payload: CreateBountyPayload) => {
      if (!walletAddress) {
        setError('Wallet not connected');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Ensure user is synced with backend before creating
        let currentUserId = userId;
        if (!currentUserId) {
          currentUserId = await syncUser(walletAddress);
          if (!currentUserId) {
            throw new Error('Failed to sync user — please reconnect wallet');
          }
        }

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
    [walletAddress, userId, addBounty, syncUser]
  );

  return { createBounty, loading, error };
}
