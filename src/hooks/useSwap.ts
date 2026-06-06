import { useState, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { fetchTokenList, simulateSwap, TON_ADDRESS } from '../api/stonfi';
import { omnistonClient } from '../api/omniston';
import { useWalletStore } from '../stores/walletStore';
import { TokenAsset, SwapQuote } from '../types/bounty';

export function useSwap() {
  const [tokens, setTokens] = useState<TokenAsset[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();
  const { address: walletAddress } = useWalletStore();

  // ─── Load tokens ──────────────────────────────────────────────────────────

  const loadTokens = useCallback(async () => {
    setLoading(true);
    try {
      const tokenList = await fetchTokenList();
      setTokens(tokenList);
      // Default to TON
      const ton = tokenList.find((t) => t.symbol === 'TON');
      if (ton) setSelectedToken(ton);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Simulate swap ────────────────────────────────────────────────────────

  const simulate = useCallback(
    async (tokenAddress: string, offerUnits: string) => {
      if (!offerUnits || offerUnits === '0') {
        setQuote(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // If token is TON, no swap needed
        if (tokenAddress === TON_ADDRESS) {
          setQuote({
            offerAddress: TON_ADDRESS,
            askAddress: TON_ADDRESS,
            offerUnits,
            minAskUnits: offerUnits, // 1:1 for TON
            priceImpact: '0',
            routerAddress: '',
            provider: 'stonfi',
          });
          return;
        }

        // 1. Get StonFi quote
        const stonfiQuote = await simulateSwap({
          offerAddress: tokenAddress,
          askAddress: TON_ADDRESS,
          offerUnits,
          slippageTolerance: '0.01',
        });

        // 2. Try Omniston for better rate
        try {
          await omnistonClient.connect();
          const bestQuote = await omnistonClient.getBestQuote({
            offerAddress: tokenAddress,
            askAddress: TON_ADDRESS,
            offerUnits,
            slippageTolerance: '0.01',
            stonfiQuote,
          });

          setQuote(bestQuote);
        } catch {
          // Fallback to StonFi if Omniston fails
          setQuote(stonfiQuote);
        }
      } catch (err: any) {
        setError(err.message);
        setQuote(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Execute swap ─────────────────────────────────────────────────────────

  const executeSwap = useCallback(
    async (swapQuote: SwapQuote) => {
      if (!walletAddress || !swapQuote) {
        setError('Wallet not connected or no quote');
        return null;
      }

      setSwapping(true);
      setError(null);

      try {
        // If TON → TON, no swap needed
        if (swapQuote.offerAddress === TON_ADDRESS && swapQuote.askAddress === TON_ADDRESS) {
          return { amount: swapQuote.offerUnits, swapped: false };
        }

        // Build transaction based on provider
        let txParams: { to: string; value: string; body?: string } | null = null;

        if (swapQuote.provider === 'omniston') {
          txParams = await omnistonClient.buildSwapTransaction({
            route: {
              id: swapQuote.routerAddress,
              sourceAsset: swapQuote.offerAddress,
              destinationAsset: swapQuote.askAddress,
              sourceAmount: swapQuote.offerUnits,
              destinationAmount: swapQuote.minAskUnits,
              priceImpact: swapQuote.priceImpact,
              steps: [],
            },
            sourceAddress: walletAddress,
            destinationAddress: walletAddress,
          });
        }

        if (!txParams) {
          // Fallback: use StonFi router directly
          txParams = {
            to: swapQuote.routerAddress,
            value: swapQuote.offerUnits,
          };
        }

        // Send transaction via TON Connect
        await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: [
            {
              address: txParams.to,
              amount: txParams.value,
              ...(txParams.body ? { payload: txParams.body } : {}),
            },
          ],
        });

        return {
          amount: swapQuote.minAskUnits,
          swapped: true,
          provider: swapQuote.provider,
        };
      } catch (err: any) {
        setError(err.message || 'Swap failed');
        return null;
      } finally {
        setSwapping(false);
      }
    },
    [walletAddress, tonConnectUI]
  );

  // ─── Reset ────────────────────────────────────────────────────────────────

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
