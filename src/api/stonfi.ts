// ─── StonFi REST API Client ───────────────────────────────────────────────────
// Fetches supported tokens and simulates swaps via StonFi DEX

import { TokenAsset, SwapQuote } from '../types/bounty';

const STONFI_API = 'https://api.ston.fi/v1';

// TON native address (used as reference for TON)
export const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

// ─── Fetch supported tokens ──────────────────────────────────────────────────

export async function fetchTokenList(): Promise<TokenAsset[]> {
  try {
    const res = await fetch(`${STONFI_API}/assets`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // StonFi returns { asset_list: [...] } or similar
    const assets = data.asset_list || data.assets || data || [];

    return (Array.isArray(assets) ? assets : []).map((a: any) => ({
      address: a.contract_address || a.address || a.token_address,
      symbol: a.token_symbol || a.symbol || '???',
      name: a.token_name || a.name || a.symbol || 'Unknown',
      decimals: a.decimals || 9,
      image: a.icon_url || a.image || a.logo_uri || undefined,
      priceUsd: a.price || a.usd_price || undefined,
    }));
  } catch (err) {
    console.error('Failed to fetch token list:', err);
    return getFallbackTokens();
  }
}

// ─── Simulate swap ───────────────────────────────────────────────────────────

export async function simulateSwap(params: {
  offerAddress: string;
  askAddress: string;
  offerUnits: string;
  slippageTolerance?: string;
}): Promise<SwapQuote | null> {
  try {
    const res = await fetch(`${STONFI_API}/swap/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offer_address: params.offerAddress,
        ask_address: params.askAddress,
        units: params.offerUnits,
        slippage_tolerance: params.slippageTolerance || '0.01',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    const data = await res.json();

    return {
      offerAddress: data.offer_address || params.offerAddress,
      askAddress: data.ask_address || params.askAddress,
      offerUnits: data.offer_units || params.offerUnits,
      minAskUnits: data.min_ask_units || '0',
      priceImpact: data.price_impact || '0',
      routerAddress: data.router_address || data.router || '',
      provider: 'stonfi',
    };
  } catch (err) {
    console.error('StonFi swap simulation failed:', err);
    return null;
  }
}

// ─── Fallback tokens ─────────────────────────────────────────────────────────

function getFallbackTokens(): TokenAsset[] {
  return [
    {
      address: TON_ADDRESS,
      symbol: 'TON',
      name: 'The Open Network',
      decimals: 9,
      priceUsd: 3.25,
    },
    {
      address: 'EQCxFRclYDjNjJ5pLJ6q2Y0gE0_VxJQ0jK0z0qL5l5l5l5',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      priceUsd: 1.0,
    },
    {
      address: 'EQAvlWFDxg2la5-ToE3_SGKBODkbO4W5v5O4F0I0kE6_Y3',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      priceUsd: 1.0,
    },
    {
      address: 'EQD0vdEA4Qj8x4l4Q8Rbt3fYg3vJ3g3vJ3g3vJ3g3vJ3g3v',
      symbol: 'NOT',
      name: 'Notcoin',
      decimals: 9,
      priceUsd: 0.01,
    },
    {
      address: 'EQCjkCxvcMDXsVoqQ8Qx1Wq0JN3g3vJ3g3vJ3g3vJ3g3vJ3',
      symbol: 'JTO',
      name: 'Jito',
      decimals: 9,
      priceUsd: 2.5,
    },
  ];
}
