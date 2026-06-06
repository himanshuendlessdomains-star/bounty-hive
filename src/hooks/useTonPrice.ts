import { useState, useEffect, useCallback } from 'react';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd';
const REFRESH_INTERVAL = 60_000; // 1 minute
const FALLBACK_PRICE = 3.25; // fallback if API fails

export function useTonPrice() {
  const [price, setPrice] = useState<number>(FALLBACK_PRICE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(COINGECKO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tonPrice = data?.['the-open-network']?.usd;
      if (tonPrice) {
        setPrice(tonPrice);
        setError(null);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err: any) {
      console.warn('Failed to fetch TON price, using fallback:', err.message);
      setError(err.message);
      // Keep the last known price or fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return { price, loading, error, refetch: fetchPrice };
}
