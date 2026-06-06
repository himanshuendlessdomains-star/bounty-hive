import { useState, useEffect, useCallback } from 'react';
import { fetchTokenList, TON_ADDRESS } from '../api/stonfi';
import { TokenAsset } from '../types/bounty';

const CACHE_KEY = 'bounty-hive-tokens';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedTokens {
  tokens: TokenAsset[];
  timestamp: number;
}

export function useTokenList() {
  const [tokens, setTokens] = useState<TokenAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { tokens: cachedTokens, timestamp }: CachedTokens = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setTokens(cachedTokens);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from API
      const freshTokens = await fetchTokenList();

      // Always ensure TON is first
      const sorted = [...freshTokens].sort((a, b) => {
        if (a.address === TON_ADDRESS) return -1;
        if (b.address === TON_ADDRESS) return 1;
        return 0;
      });

      setTokens(sorted);

      // Cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ tokens: sorted, timestamp: Date.now() })
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const getTokenByAddress = useCallback(
    (address: string) => tokens.find((t) => t.address === address),
    [tokens]
  );

  const getTokenBySymbol = useCallback(
    (symbol: string) => tokens.find((t) => t.symbol === symbol),
    [tokens]
  );

  return {
    tokens,
    loading,
    error,
    loadTokens,
    getTokenByAddress,
    getTokenBySymbol,
  };
}
