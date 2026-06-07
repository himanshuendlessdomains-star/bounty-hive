import { useState, useEffect, useCallback } from 'react';
import { api, BountyResponse, mapBounty } from '../api/client';
import { useBountyStore } from '../stores/bountyStore';

// ─── Fetch bounties list ─────────────────────────────────────────────────────

export function useBounties(params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const [bounties, setBounties] = useState<BountyResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBounties(params);
      setBounties(res.bounties);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.type, params?.page, params?.limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { bounties, total, loading, error, refetch: fetch };
}

// ─── Fetch single bounty ─────────────────────────────────────────────────────

export function useBounty(id: string | null) {
  const [bounty, setBounty] = useState<BountyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getBounty(id)
      .then(setBounty)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { bounty, loading, error };
}

// ─── Create bounty (API + contract) ──────────────────────────────────────────

export function useCreateBounty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addBounty } = useBountyStore();

  const create = useCallback(async (data: {
    title: string;
    description: string;
    type: string;
    poolAmount: string;
    winnerCount: number;
    winnerSelection: string;
    verification: string;
    verificationRule?: string;
    escrowAddress?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const bounty = await api.createBounty(data);
      addBounty(mapBounty(bounty));
      return bounty;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addBounty]);

  return { create, loading, error };
}

// ─── Submit proof ────────────────────────────────────────────────────────────

export function useSubmitProof() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: {
    bountyId: string;
    proofUrl: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      return await api.submitProof(data);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}