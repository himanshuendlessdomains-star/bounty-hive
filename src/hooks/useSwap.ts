import { useState, useCallback } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { TokenAsset, SwapQuote } from '../types/bounty';
import { MOCK_TOKENS } from '../api/mock';

const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

export function useSwap() {
  const [tokens, setTokens] = useState<TokenAsset[]>(MOCK_TOKENS);
  const [selectedToken, setSelectedToken] = useState<TokenAsset | null>(MOCK_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    setTokens(MOCK_TOKENS);
    const ton = MOCK_TOKENS.find((t) => t.symbol === 'TON');
    if (ton) setSelectedToken(ton);
  }, []);

  const simulate = useCallback(
    async (tokenAddress: string, offerUnits: string) => {
      if (!offerUnits || offerUnits === '0') {
        setQuote(null);
        return;
      }

      setLoading(true);
      setError(null);

      // Mock: simulate a swap quote
      await new Promise((r) => setTimeout(r, 300));

      const isTon = tokenAddress === TON_ADDRESS;
      const mockQuote: SwapQuote = {
        offerAddress: tokenAddress,
        askAddress: TON_ADDRESS,
        offerUnits,
        minAskUnits: isTon ? offerUnits : String(Math.floor(Number(offerUnits) * 0.95)),
        priceImpact: '0.5',
        routerAddress: 'EQD...router',
        provider: 'stonfi',
      };

      setQuote(mockQuote);
      setLoading(false);
    },
    []
  );

  const executeSwap = useCallback(
    async (swapQuote: SwapQuote) => {
      setSwapping(true);
      setError(null);

      // Mock: simulate swap execution
      await new Promise((r) => setTimeout(r, 1000));

      setSwapping(false);
      return { amount: swapQuote.minAskUnits, swapped: true };
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
