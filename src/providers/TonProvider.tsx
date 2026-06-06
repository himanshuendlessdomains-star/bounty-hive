import { TonConnectUI } from '@tonconnect/ui-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { getTonConnectUI } from '../contracts/tonConnect';

interface TonContextType {
  tonConnectUI: TonConnectUI | null;
}

const TonContext = createContext<TonContextType>({ tonConnectUI: null });

export function TonProvider({ children }: { children: React.ReactNode }) {
  const [connector, setConnector] = useState<TonConnectUI | null>(null);
  const { setAddress, setConnected, setBalance } = useWalletStore();

  useEffect(() => {
    const ui = getTonConnectUI();
    setConnector(ui);

    // Restore connection
    ui.onStatusChange((wallet) => {
      if (wallet) {
        setAddress(wallet.account.address);
        setConnected(true);
      } else {
        setAddress(null);
        setConnected(false);
        setBalance('0');
      }
    });

    // Check if already connected
    if (ui.connected) {
      const wallet = ui.wallet;
      if (wallet) {
        setAddress(wallet.account.address);
        setConnected(true);
      }
    }
  }, [setAddress, setConnected, setBalance]);

  return (
    <TonContext.Provider value={{ tonConnectUI: connector }}>
      {children}
    </TonContext.Provider>
  );
}

export function useTonContext() {
  return useContext(TonContext);
}
