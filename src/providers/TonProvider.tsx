import { useState, useEffect, type ReactNode } from 'react';
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
  const [tonFailed, setTonFailed] = useState(false);

  // If TonConnect fails to initialize (bad manifest, network error, etc.),
  // still render the app — just without wallet features
  if (tonFailed) {
    return <>{children}</>;
  }

  return (
    <TonConnectUIProvider
      manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
    >
      <WalletStateSync />
      {children}
    </TonConnectUIProvider>
  );
}
