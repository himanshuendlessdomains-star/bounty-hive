import { useState, useCallback } from 'react';
import { TON_ADDRESS } from '../api/stonfi';
import { TokenAsset, SwapQuote } from '../types/bounty';
import { FALLBACK_TOKENS } from '../api/stonfi';

export function useSwap() {
  const [tokens, setTokens] = useState<TokenAsset[]>(FALLBACK_TOKENS);
  const [selectedToken, setSelectedToken] = useState<TokenAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    // Already loaded from fallback
    const ton = FALLBACK_TOKENS.find(t => t.symbol === 'TON');
    if (ton && !selectedToken) setSelectedToken(ton);
  }, []);

  const simulate = useCallback(
    async (tokenAddress: string, offerUnits: string) => {
      if (!offerUnits || offerUnits === '0') {
        setQuote(null);
        return;
      }

      // Mock: if TON, 1:1; otherwise estimate based on price
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
      // Mock: just return success
      await new Promise(r => setTimeout(r, 800));
      return { amount: swapQuote.minAskUnits, swapped: swapQuote.offerAddress !== TON_ADDRESS };
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
