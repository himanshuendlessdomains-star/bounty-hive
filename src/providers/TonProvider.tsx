import { useState, useEffect, type ReactNode, Component, type ErrorInfo } from 'react';
import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react';
import { useWalletStore } from '../stores/walletStore';

class TonConnectErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('TonConnect failed to initialize:', error, info);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>;
    }
    return this.props.children;
  }
}

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

  // If TonConnect previously failed, render children without wallet provider.
  // WalletButton has its own error boundary for the missing context case.
  if (tonFailed) {
    return <>{children}</>;
  }

  return (
    <TonConnectErrorBoundary onError={() => setTonFailed(true)}>
      <TonConnectUIProvider
        manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}
      >
        <WalletStateSync />
        {children}
      </TonConnectUIProvider>
    </TonConnectErrorBoundary>
  );
}
