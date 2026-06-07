import { Component, type ReactNode } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { shortenAddress } from '../utils/format';

// ─── Error boundary: if TonConnect context is missing, show fallback ─────────
class WalletErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('WalletButton: TonConnect not available:', error.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Inner button that uses TonConnect hooks ──────────────────────────────────
function ConnectedWalletButton() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();

  const handleConnect = async () => {
    try { await tonConnectUI.connectWallet(); } catch { /* user cancelled */ }
  };

  const handleDisconnect = async () => {
    try { await tonConnectUI.disconnect(); } catch { /* ignore */ }
  };

  if (address) {
    return (
      <button
        onClick={handleDisconnect}
        className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm hover:bg-[var(--border)] transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-hive-500" />
        <span className="text-white font-mono">{shortenAddress(address)}</span>
      </button>
    );
  }

  return (
    <button onClick={handleConnect} className="btn-primary text-sm">
      Connect Wallet
    </button>
  );
}

// ─── Fallback when TonConnect is not available ────────────────────────────────
function FallbackWalletButton() {
  return (
    <button
      disabled
      className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] cursor-not-allowed opacity-60"
      title="Wallet connection unavailable — connect inside Telegram or ensure TonConnect is set up"
    >
      <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
      <span>Wallet</span>
    </button>
  );
}

// ─── Exported component with error boundary ────────────────────────────────────
export function WalletButton() {
  return (
    <WalletErrorBoundary fallback={<FallbackWalletButton />}>
      <ConnectedWalletButton />
    </WalletErrorBoundary>
  );
}
