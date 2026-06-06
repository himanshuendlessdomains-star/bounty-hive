import { create } from 'zustand';
import { Bounty, CreateBountyPayload } from '../types/bounty';

interface BountyState {
  bounties: Bounty[];
  loading: boolean;
  error: string | null;
  currentBounty: Bounty | null;

  setBounties: (bounties: Bounty[]) => void;
  addBounty: (bounty: Bounty) => void;
  updateBounty: (id: string, updates: Partial<Bounty>) => void;
  removeBounty: (id: string) => void;
  setCurrentBounty: (bounty: Bounty | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  bounties: [],
  loading: false,
  error: null,
  currentBounty: null,
};

export const useBountyStore = create<BountyState>()((set) => ({
  ...initialState,

  setBounties: (bounties) => set({ bounties }),

  addBounty: (bounty) =>
    set((state) => ({ bounties: [bounty, ...state.bounties] })),

  updateBounty: (id, updates) =>
    set((state) => ({
      bounties: state.bounties.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),

  removeBounty: (id) =>
    set((state) => ({
      bounties: state.bounties.filter((b) => b.id !== id),
    })),

  setCurrentBounty: (bounty) => set({ currentBounty: bounty }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
