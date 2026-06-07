import { useState, useCallback } from 'react';

// ─── Mock mode: no real contract calls ────────────────────────────────────────
const USE_MOCK = !import.meta.env.VITE_API_URL;

export function useEscrowContract(escrowAddress: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProof = useCallback(
    async (proofUrl: string) => {
      if (USE_MOCK) {
        // Mock: just return success
        return true as const;
      }
      // Real mode will be implemented when smart contracts are ready
      return true as const;
    },
    [escrowAddress]
  );

  const approveSubmission = useCallback(
    async (submissionId: string) => {
      if (USE_MOCK) return true as const;
      return true as const;
    },
    [escrowAddress]
  );

  const rejectSubmission = useCallback(
    async (submissionId: string) => {
      if (USE_MOCK) return true as const;
      return true as const;
    },
    [escrowAddress]
  );

  const cancelBounty = useCallback(
    async () => {
      if (USE_MOCK) return true as const;
      return true as const;
    },
    [escrowAddress]
  );

  return { submitProof, approveSubmission, rejectSubmission, cancelBounty, loading, error };
}
