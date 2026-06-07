import { useState, useEffect, useCallback } from 'react';
import { MOCK_TON_PRICE } from '../api/mock';

// ─── Mock mode: returns fixed price, no API calls ─────────────────────────────
const USE_MOCK = !import.meta.env.VITE_API_URL;
const FALLBACK_PRICE = MOCK_TON_PRICE; // $3.25

export function useTonPrice() {
  const [price, setPrice] = useState<number>(FALLBACK_PRICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (USE_MOCK) {
      setPrice(FALLBACK_PRICE);
      setLoading(false);
      return;
    }

    // Real mode: fetch from CoinGecko with fallback
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
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
      // Keep the fallback price — UI still works
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK) {
      setLoading(false);
      return;
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return { price, loading, error, refetch: fetchPrice };
}
