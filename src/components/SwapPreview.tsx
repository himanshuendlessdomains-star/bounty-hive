import { SwapQuote, TokenAsset } from '../types/bounty';
import { formatTon, formatUsd } from '../utils/format';

interface SwapPreviewProps {
  quote: SwapQuote | null;
  inputToken: TokenAsset | null;
  inputAmount: string;
  tonPrice: number;
  loading?: boolean;
}

export function SwapPreview({ quote, inputToken, inputAmount, tonPrice, loading }: SwapPreviewProps) {
  if (loading) return <div className="card animate-pulse"><div className="h-4 bg-[var(--border)] rounded w-1/2 mb-2" /><div className="h-6 bg-[var(--border)] rounded w-3/4" /></div>;
  if (!quote) return null;

  const isDirectTon = quote.offerAddress === quote.askAddress;
  const outputTon = isDirectTon ? parseFloat(inputAmount || '0') : parseFloat(quote.minAskUnits) / 1e9;
  const outputUsd = outputTon * tonPrice;
  const priceImpact = parseFloat(quote.priceImpact || '0');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium text-sm">Swap Preview</h4>
        <span className={`badge ${quote.provider === 'omniston' ? 'badge-active' : 'badge-completed'}`}>
          {quote.provider === 'omniston' ? '⚡ Omniston' : '🔄 StonFi'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-sm">You pay</span>
          <span className="text-white font-medium">{inputAmount} {inputToken?.symbol || 'TON'}</span>
        </div>
        <div className="flex items-center justify-center py-1">
          <svg className="w-5 h-5 text-hive-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)] text-sm">You receive</span>
          <span className="text-hive-500 font-bold">{isDirectTon ? inputAmount : formatTon(quote.minAskUnits)} TON</span>
        </div>
        <div className="border-t border-[var(--border)] pt-2 mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Est. USD value</span>
            <span className="text-[var(--text-secondary)]">≈ {formatUsd(outputUsd)}</span>
          </div>
          {!isDirectTon && priceImpact > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Price impact</span>
              <span className={priceImpact > 3 ? 'text-red-400' : 'text-hive-500'}>{priceImpact.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
