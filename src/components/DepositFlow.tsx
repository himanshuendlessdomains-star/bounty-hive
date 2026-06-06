import React, { useState, useEffect } from 'react';
import { useSwap } from '../hooks/useSwap';
import { useTokenList } from '../hooks/useTokenList';
import { useTonPrice } from '../hooks/useTonPrice';
import { TokenSelector } from './TokenSelector';
import { SwapPreview } from './SwapPreview';
import { TON_ADDRESS } from '../api/stonfi';
import { toNano } from '../utils/format';

interface DepositFlowProps {
  onDeposit: (tonAmount: string) => void;
  loading?: boolean;
}

export function DepositFlow({ onDeposit, loading }: DepositFlowProps) {
  const { price: tonPrice } = useTonPrice();
  const { tokens, loading: tokensLoading } = useTokenList();
  const { selectedToken, setSelectedToken, amount, setAmount, quote, loading: swapLoading, swapping, error: swapError, simulate, executeSwap, loadTokens } = useSwap();
  const [step, setStep] = useState<'select' | 'swap' | 'confirm'>('select');
  const [swapResult, setSwapResult] = useState<{ amount: string; swapped: boolean } | null>(null);

  useEffect(() => { loadTokens(); }, []);

  useEffect(() => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) return;
    if (selectedToken.address === TON_ADDRESS) {
      simulate(TON_ADDRESS, toNano(amount).toString());
    } else {
      const units = toNano(amount, selectedToken.decimals).toString();
      simulate(selectedToken.address, units);
    }
  }, [selectedToken, amount]);

  const handleSelectToken = (token: any) => { setSelectedToken(token); setAmount(''); setStep('swap'); };

  const handleSwap = async () => {
    if (!quote) return;
    const result = await executeSwap(quote);
    if (result) { setSwapResult(result); setStep('confirm'); }
  };

  const handleConfirm = () => { if (swapResult) onDeposit(swapResult.amount); };

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
              <div><p className="text-white font-medium">{selectedToken.symbol}</p><p className="text-[var(--text-muted)] text-xs">{selectedToken.name}</p></div>
            </div>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field text-2xl font-bold mb-2" min="0" step="any" />
            {selectedToken.priceUsd && amount && <p className="text-[var(--text-muted)] text-sm">≈ ${(parseFloat(amount) * selectedToken.priceUsd).toFixed(2)}</p>}
          </div>
          {!isTon && <SwapPreview quote={quote} inputToken={selectedToken} inputAmount={amount} tonPrice={tonPrice} loading={swapLoading} />}
          {swapError && <p className="text-red-400 text-sm">{swapError}</p>}
          <button onClick={isTon ? () => setStep('confirm') : handleSwap} disabled={!amount || parseFloat(amount) <= 0 || (swapLoading && !isTon)} className="btn-primary w-full">
            {swapLoading ? 'Swapping...' : isTon ? 'Continue' : `Swap ${selectedToken.symbol} → TON`}
          </button>
        </>
      )}
      {step === 'confirm' && (
        <>
          <h3 className="text-white font-semibold">Confirm deposit</h3>
          <div className="card">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Amount</span><span className="text-white font-medium">{amount} {selectedToken?.symbol || 'TON'}</span></div>
              {!isTon && swapResult?.swapped && <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Swapped to</span><span className="text-hive-500 font-medium">≈ TON</span></div>}
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">USD value</span><span className="text-[var(--text-secondary)]">≈ ${(parseFloat(amount) * (selectedToken?.priceUsd || tonPrice)).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Platform fee</span><span className="text-[var(--text-secondary)]">1%</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('swap')} className="btn-secondary flex-1">Back</button>
            <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">{loading ? 'Depositing...' : 'Deposit to Escrow'}</button>
          </div>
        </>
      )}
    </div>
  );
}
