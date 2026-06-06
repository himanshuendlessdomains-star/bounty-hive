import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { shortenAddress } from '../utils/format';

export function WalletButton() {
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
