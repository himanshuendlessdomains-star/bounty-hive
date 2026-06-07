import { useState, useEffect, useCallback } from 'react';
import { TokenAsset } from '../types/bounty';
import { MOCK_TOKENS } from '../api/mock';

const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

export function useTokenList() {
  const [tokens, setTokens] = useState<TokenAsset[]>(MOCK_TOKENS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    setLoading(false);
    setTokens(MOCK_TOKENS);
    setError(null);
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const getTokenByAddress = useCallback(
    (address: string) => tokens.find((t) => t.address === address) || null,
    [tokens]
  );

  return { tokens, loading, error, loadTokens, getTokenByAddress };
}
