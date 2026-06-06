import React from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useWalletStore } from '../stores/walletStore';
import { shortenAddress } from '../utils/format';

export function WalletButton() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { setConnected, setAddress } = useWalletStore();

  React.useEffect(() => {
    setAddress(address || null);
    setConnected(!!address);
  }, [address, setAddress, setConnected]);

  const handleConnect = async () => {
    try { await tonConnectUI.connectWallet(); } catch (err) { console.error('Wallet connection failed:', err); }
  };

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
      setAddress(null);
      setConnected(false);
    } catch (err) { console.error('Wallet disconnect failed:', err); }
  };

  if (address) {
    return (
      <button onClick={handleDisconnect} className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm hover:bg-[var(--border)] transition-colors">
        <div className="w-2 h-2 rounded-full bg-hive-500" />
        <span className="text-white font-mono">{shortenAddress(address)}</span>
      </button>
    );
  }

  return <button onClick={handleConnect} className="btn-primary text-sm">Connect Wallet</button>;
}
