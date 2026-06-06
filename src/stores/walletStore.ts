import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  balance: string;
  connected: boolean;
  connecting: boolean;

  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  reset: () => void;
}

const initialState = {
  address: null,
  balance: '0',
  connected: false,
  connecting: false,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      ...initialState,

      setAddress: (address) => set({ address }),
      setBalance: (balance) => set({ balance }),
      setConnected: (connected) => set({ connected }),
      setConnecting: (connecting) => set({ connecting }),
      reset: () => set(initialState),
    }),
    {
      name: 'bounty-hive-wallet',
      partialize: (state) => ({ address: state.address, connected: state.connected }),
    }
  )
);
