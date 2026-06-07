import { useState, useEffect } from 'react';
import { useSwap } from '../hooks/useSwap';
import { useTokenList } from '../hooks/useTokenList';
import { useTonPrice } from '../hooks/useTonPrice';
import { TokenSelector } from './TokenSelector';
import { SwapPreview } from './SwapPreview';
import { TON_ADDRESS } from '../api/stonfi';
import { toNano, fromNano } from '../utils/format';
import { useWalletStore } from '../stores/walletStore';

interface DepositFlowProps {
  onDeposit: (tonAmount: string) => void;
  loading?: boolean;
}

export function DepositFlow({ onDeposit, loading }: DepositFlowProps) {
  const { price: tonPrice } = useTonPrice();
  const { tokens } = useTokenList();
  const { selectedToken, setSelectedToken, amount, setAmount, quote, loading: swapLoading, error: swapError, simulate, executeSwap, loadTokens } = useSwap();
  const { address: walletAddress } = useWalletStore();
  const [step, setStep] = useState<'select' | 'swap' | 'confirm'>('select');
  const [swapResult, setSwapResult] = useState<{ amount: string; swapped: boolean } | null>(null);

  useEffect(() => { loadTokens(); }, [loadTokens]);

  useEffect(() => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) return;
    if (selectedToken.address === TON_ADDRESS) {
      simulate(TON_ADDRESS, toNano(amount).toString());
    } else {
      const units = toNano(amount, selectedToken.decimals).toString();
      simulate(selectedToken.address, units);
    }
  }, [selectedToken, amount, simulate]);

  const handleSelectToken = (token: any) => { setSelectedToken(token); setAmount(''); setStep('swap'); };

  const handleSwap = async () => {
    if (!quote || !walletAddress) return;
    const result = await executeSwap(quote, walletAddress);
    if (result) { setSwapResult(result); setStep('confirm'); }
  };

  const handleConfirm = () => { if (swapResult) onDeposit(swapResult.amount); };

  const handleDirectTonDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const tonAmount = toNano(amount).toString();
    onDeposit(tonAmount);
  };

  const isTon = selectedToken?.address === TON_ADDRESS;

  return (
    <div className="space-y-4">
      {step === 'select' && (
        <>
          <h3 className="text-white font-semibold">Select deposit token</h3>
          <p className="text-[var(--text-secondary)] text-sm">Choose a token to deposit. Non-TON tokens will be swapped to TON via the best available route.</p>
          <TokenSelector tokens={tokens} selected={selectedToken} onSelect={handleSelectToken} />
        </>
      )}
      {step === 'swap' && selectedToken && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{isTon ? 'Deposit TON' : `Swap ${selectedToken.symbol} → TON`}</h3>
            <button onClick={() => { setStep('select'); setAmount(''); }} className="text-[var(--text-muted)] text-sm hover:text-white">Change token</button>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              {selectedToken.image ? <img src={selectedToken.image} alt={selectedToken.symbol} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-hive-500/20 flex items-center justify-center text-hive-500 text-sm font-bold">{selectedToken.symbol.slice(0, 2)}</div>}
              <div>
                <p className="text-white font-medium">{selectedToken.symbol}</p>
                <p className="text-[var(--text-muted)] text-xs">{selectedToken.name}</p>
              </div>
            </div>
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field text-2xl font-bold"
              min="0"
              step="any"
            />
            {amount && parseFloat(amount) > 0 && (
              <p className="text-[var(--text-muted)] text-sm mt-1">
                ≈ {isTon ? `$${(parseFloat(amount) * tonPrice).toFixed(2)}` : `${parseFloat(amount) * (selectedToken.priceUsd ?? 0)} USD`}
              </p>
            )}
          </div>

          {swapLoading && <div className="card animate-pulse"><div className="h-4 bg-[var(--border)] rounded w-1/2 mb-2" /><div className="h-6 bg-[var(--border)] rounded w-3/4" /></div>}

          {swapError && (
            <div className="card border-red-500/30 bg-red-500/10">
              <p className="text-red-400 text-sm">{swapError}</p>
            </div>
          )}

          {quote && !swapLoading && (
            <SwapPreview
              quote={quote}
              inputToken={selectedToken}
              inputAmount={amount}
              tonPrice={tonPrice}
            />
          )}

          <button
            onClick={isTon ? handleDirectTonDeposit : handleSwap}
            disabled={!amount || parseFloat(amount) <= 0 || (!isTon && !quote) || loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : isTon ? 'Deposit TON' : 'Swap to TON'}
          </button>
        </>
      )}
      {step === 'confirm' && swapResult && (
        <>
          <h3 className="text-white font-semibold">Confirm deposit</h3>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-secondary)]">Amount</span>
              <span className="text-white font-bold">{fromNano(swapResult.amount)} TON</span>
            </div>
            {swapResult.swapped && (
              <p className="text-hive-500 text-xs">✓ Swapped from another token</p>
            )}
          </div>
          <button onClick={handleConfirm} disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating bounty...' : 'Confirm & Create Bounty'}
          </button>
        </>
      )}
    </div>
  );
}