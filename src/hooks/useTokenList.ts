import { useState, useEffect, useCallback } from 'react';
import { FALLBACK_TOKENS } from '../api/stonfi';
import { TokenAsset } from '../types/bounty';

export function useTokenList() {
  const [tokens, setTokens] = useState<TokenAsset[]>(FALLBACK_TOKENS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    setTokens(FALLBACK_TOKENS);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const getTokenByAddress = useCallback(
    (address: string) => tokens.find(t => t.address === address),
    [tokens]
  );

  const getTokenBySymbol = useCallback(
    (symbol: string) => tokens.find(t => t.symbol === symbol),
    [tokens]
  );

  return { tokens, loading, error, loadTokens, getTokenByAddress, getTokenBySymbol };
}