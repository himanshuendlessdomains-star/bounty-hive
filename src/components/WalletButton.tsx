import { useWalletStore } from '../stores/walletStore';
import { truncateAddress } from '../utils/format';

export function WalletButton() {
  const { isConnected, address, disconnect } = useWalletStore();

  if (!isConnected || !address) {
    return (
      <button className="bg-hive-500 hover:bg-hive-600 text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={disconnect}
      className="bg-[var(--bg-card)] border border-[var(--border)] text-white px-4 py-2 rounded-xl text-sm hover:border-red-500/50 transition-colors"
    >
      {truncateAddress(address)}
    </button>
  );
}
