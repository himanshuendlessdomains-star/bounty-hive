import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

interface UserState {
  userId: string | null;
  username: string | null;
  displayName: string | null;
  loading: boolean;

  setUserId: (id: string | null) => void;
  syncUser: (tonAddress: string) => Promise<string | null>;
  reset: () => void;
}

const initialState = {
  userId: null,
  username: null,
  displayName: null,
  loading: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserId: (id) => set({ userId: id }),

      syncUser: async (tonAddress: string) => {
        if (get().loading) return get().userId;
        set({ loading: true });
        try {
          const user = await api.upsertUser({
            tonAddress,
            displayName: tonAddress.slice(0, 6) + '...' + tonAddress.slice(-4),
          });
          set({
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            loading: false,
          });
          return user.id;
        } catch (err) {
          console.error('Failed to sync user:', err);
          set({ loading: false });
          return null;
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'bounty-hive-user',
      partialize: (state) => ({ userId: state.userId, username: state.username, displayName: state.displayName }),
    }
  )
);