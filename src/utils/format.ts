/**
 * Format TON amount for display
 */
export function formatTon(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toFixed(num < 0.01 ? 4 : 2);
}

/**
 * Format USD amount for display
 */
export function formatUsd(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

/**
 * Calculate per-winner payout
 */
export function calcPerWinner(pool: string, winners: number): string {
  const poolNum = parseFloat(pool);
  if (isNaN(poolNum) || winners <= 0) return '0';
  return (poolNum / winners).toFixed(4);
}

/**
 * Validate minimum payout ($0.01)
 */
export function validateMinPayout(perWinnerTon: string, tonPrice: number): boolean {
  const perWinnerUsd = parseFloat(perWinnerTon) * tonPrice;
  return perWinnerUsd >= 0.01;
}

/**
 * Format countdown timer
 */
export function formatCountdown(h: number, m: number, s: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Truncate wallet address for display
 */
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
