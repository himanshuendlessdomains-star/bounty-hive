// ─── StonFi — Mock Mode ──────────────────────────────────────────────────────
// No real API calls. Only exports fallback tokens and TON_ADDRESS.

import { TokenAsset } from '../types/bounty';

export const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

export const FALLBACK_TOKENS: TokenAsset[] = [
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

// Kept for type compatibility — not used in mock mode
export async function fetchTokenList(): Promise<TokenAsset[]> {
  return FALLBACK_TOKENS;
}

export async function simulateSwap(): Promise<null> {
  return null;
}
