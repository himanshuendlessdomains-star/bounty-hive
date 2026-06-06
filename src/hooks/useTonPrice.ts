import { useState, useEffect } from 'react';

const TON_PRICE_API = 'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd';

export function useTonPrice() {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(TON_PRICE_API);
        const data = await res.json();
        setPrice(data['the-open-network']?.usd ?? 0);
      } catch {
        setPrice(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { price, loading };
}
