import { create } from 'zustand';
import type { Bounty, CreateBountyPayload } from '../types/bounty';

interface BountyState {
  bounties: Bounty[];
  currentBounty: Bounty | null;
  createDraft: CreateBountyPayload | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBounties: (bounties: Bounty[]) => void;
  setCurrentBounty: (bounty: Bounty | null) => void;
  setCreateDraft: (draft: CreateBountyPayload | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addBounty: (bounty: Bounty) => void;
  updateBounty: (id: string, updates: Partial<Bounty>) => void;
}

export const useBountyStore = create<BountyState>((set) => ({
  bounties: [],
  currentBounty: null,
  createDraft: null,
  isLoading: false,
  error: null,

  setBounties: (bounties) => set({ bounties }),
  setCurrentBounty: (bounty) => set({ currentBounty: bounty }),
  setCreateDraft: (draft) => set({ createDraft: draft }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addBounty: (bounty) =>
    set((state) => ({ bounties: [bounty, ...state.bounties] })),

  updateBounty: (id, updates) =>
    set((state) => ({
      bounties: state.bounties.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),
}));
