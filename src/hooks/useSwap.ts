import { useState, useCallback } from 'react';
import { TON_ADDRESS, FALLBACK_TOKENS } from '../api/stonfi';
import { TokenAsset, SwapQuote } from '../types/bounty';

export function useSwap() {
  const [tokens] = useState<TokenAsset[]>(FALLBACK_TOKENS);
  const [selectedToken, setSelectedToken] = useState<TokenAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    const ton = FALLBACK_TOKENS.find(t => t.symbol === 'TON');
    if (ton && !selectedToken) setSelectedToken(ton);
  }, []);

  const simulate = useCallback(
    async (tokenAddress: string, offerUnits: string) => {
      if (!offerUnits || offerUnits === '0') {
        setQuote(null);
        return;
      }

      const token = FALLBACK_TOKENS.find(t => t.address === tokenAddress);
      const tonPrice = 3.25;
      const tokenPrice = token?.priceUsd ?? 1;
      const tonEquivalent = tokenAddress === TON_ADDRESS
        ? offerUnits
        : String(Math.floor((parseFloat(offerUnits) * tokenPrice / tonPrice) * 1e9));

      setQuote({
        offerAddress: tokenAddress,
        askAddress: TON_ADDRESS,
        offerUnits,
        minAskUnits: tonEquivalent,
        priceImpact: '0.5',
        routerAddress: '',
        provider: 'stonfi',
      });
    },
    []
  );

  const executeSwap = useCallback(
    async (swapQuote: SwapQuote) => {
      setSwapping(true);
      setError(null);
      try {
        await new Promise(r => setTimeout(r, 800));
        return { amount: swapQuote.minAskUnits, swapped: swapQuote.offerAddress !== TON_ADDRESS };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Swap failed';
        setError(msg);
        return null;
      } finally {
        setSwapping(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setSelectedToken(null);
    setAmount('');
    setQuote(null);
    setError(null);
  }, []);

  return {
    tokens,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    quote,
    loading,
    swapping,
    error,
    loadTokens,
    simulate,
    executeSwap,
    reset,
  };
}
