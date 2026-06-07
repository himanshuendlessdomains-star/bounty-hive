import { useState, useCallback } from 'react';
import { fetchTokenList, getBestQuote, getSwapRoute, TON_ADDRESS } from '../api/stonfi';
import { TokenAsset, SwapQuote, SwapRoute } from '../types/bounty';
import { getTonConnectUI } from '../contracts/tonConnect';

export function useSwap() {
  const [tokens, setTokens] = useState<TokenAsset[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchTokenList();
      setTokens(list);
      const ton = list.find(t => t.address === TON_ADDRESS);
      if (ton && !selectedToken) setSelectedToken(ton);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }, [selectedToken]);

  const simulate = useCallback(
    async (tokenAddress: string, offerUnits: string) => {
      if (!offerUnits || offerUnits === '0') {
        setQuote(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await getBestQuote({
          offerAddress: tokenAddress,
          askAddress: TON_ADDRESS,
          offerUnits,
          slippageTolerance: '0.01',
        });
        setQuote(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Quote failed');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const executeSwap = useCallback(
    async (swapQuote: SwapQuote, walletAddress: string) => {
      setSwapping(true);
      setError(null);
      try {
        const route: SwapRoute | null = await getSwapRoute({
          offerAddress: swapQuote.offerAddress,
          askAddress: swapQuote.askAddress,
          offerUnits: swapQuote.offerUnits,
          slippageTolerance: '0.01',
          userWalletAddress: walletAddress,
        });

        if (!route) {
          if (swapQuote.offerAddress === TON_ADDRESS) {
            return { amount: swapQuote.offerUnits, swapped: false };
          }
          throw new Error('No swap route available. Try depositing TON directly.');
        }

        if (swapQuote.offerAddress === TON_ADDRESS) {
          return { amount: swapQuote.offerUnits, swapped: false };
        }

        const ui = getTonConnectUI();
        const txParams = route.txParams;

        const result = await ui.sendTransaction({
          messages: [{
            address: txParams.to,
            amount: txParams.value,
            payload: txParams.body,
          }],
          validUntil: Math.floor(Date.now() / 1000) + 600,
        });

        return {
          amount: swapQuote.minAskUnits,
          swapped: true,
          txBoc: result.boc,
        };
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