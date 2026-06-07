import { useState, useCallback } from 'react';
import { fetchTokenList, getBestQuote, getSwapRoute, TON_ADDRESS } from '../api/stonfi';
import { TokenAsset, SwapQuote, SwapRoute } from '../types/bounty';
import { getTonConnectUI } from '../contracts/tonConnect';
import { toNano, fromNano } from '../utils/format';

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
  }, []);

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
          slippageTolerance: '0.01', // 1%
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
        // Get the full route with transaction params
        const route: SwapRoute | null = await getSwapRoute({
          offerAddress: swapQuote.offerAddress,
          askAddress: swapQuote.askAddress,
          offerUnits: swapQuote.offerUnits,
          slippageTolerance: '0.01',
          userWalletAddress: walletAddress,
        });

        if (!route) {
          // No route available — for direct TON deposits, just return the amount
          if (swapQuote.offerAddress === TON_ADDRESS) {
            return { amount: swapQuote.offerUnits, swapped: false };
          }
          throw new Error('No swap route available. Try depositing TON directly.');
        }

        // If it's a direct TON deposit (no swap needed), skip the transaction
        if (swapQuote.offerAddress === TON_ADDRESS) {
          return { amount: swapQuote.offerUnits, swapped: false };
        }

        // Send the swap transaction via TonConnect
        const ui = getTonConnectUI();
        const txParams = route.txParams;

        const result = await ui.sendTransaction({
          messages: [{
            address: txParams.to,
            amount: txParams.value,
            payload: txParams.body,
          }],
          validUntil: Math.floor(Date.now() / 1000) + 600, // 10 min
        });

        // After successful swap, the user receives TON in their wallet
        // Return the expected TON amount from the quote
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