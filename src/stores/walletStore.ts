import { create } from 'zustand';

interface WalletState {
  address: string | null;
  balance: string; // TON balance
  isConnected: boolean;
  isLoading: boolean;

  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: '0',
  isConnected: false,
  isLoading: false,

  setAddress: (address) => set({ address, isConnected: !!address }),
  setBalance: (balance) => set({ balance }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  disconnect: () => set({ address: null, balance: '0', isConnected: false }),
}));
