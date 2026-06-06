import { useEffect, type ReactNode } from 'react';
import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react';
import { useWalletStore } from '../stores/walletStore';

function WalletStateSync() {
  const address = useTonAddress();
  const { setAddress, setConnected, setBalance } = useWalletStore();

  useEffect(() => {
    setAddress(address || null);
    setConnected(!!address);
    if (!address) setBalance('0');
  }, [address, setAddress, setConnected, setBalance]);

  return null;
}

export function TonProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
      <WalletStateSync />
      {children}
    </TonConnectUIProvider>
  );
}
