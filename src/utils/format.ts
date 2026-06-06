// ─── TON Formatting ──────────────────────────────────────────────────────────

export function formatTon(nanotons: string | number | bigint): string {
  const n = typeof nanotons === 'bigint' ? Number(nanotons) : Number(nanotons);
  const tons = n / 1e9;
  if (tons >= 1000) return `${(tons / 1000).toFixed(1)}K`;
  if (tons >= 1) return tons.toFixed(tons % 1 === 0 ? 0 : 2);
  if (tons >= 0.001) return tons.toFixed(3);
  return tons.toExponential(2);
}

export function formatUsd(usd: string | number): string {
  const n = typeof usd === 'string' ? parseFloat(usd) : usd;
  if (isNaN(n)) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export function toNano(tons: string | number): bigint {
  const str = typeof tons === 'number' ? tons.toString() : tons;
  const [intPart, decPart = ''] = str.split('.');
  const dec = (decPart + '000000000').slice(0, 9);
  return BigInt(intPart + dec);
}

export function fromNano(nanotons: bigint | string): string {
  const str = nanotons.toString();
  const intPart = str.slice(0, -9) || '0';
  const decPart = str.slice(-9).padStart(9, '0');
  const trimmed = decPart.replace(/0+$/, '');
  return trimmed ? `${intPart}.${trimmed}` : intPart;
}

// ─── Bounty Calculations ──────────────────────────────────────────────────────

export function calcPerWinner(poolAmount: string, winnerCount: number): string {
  const pool = parseFloat(poolAmount);
  if (isNaN(pool) || winnerCount <= 0) return '0';
  return (pool / winnerCount).toFixed(6);
}

export function validateMinPayout(poolAmount: string, winnerCount: number, tonPriceUsd: number): { valid: boolean; perWinnerUsd: number } {
  const perWinner = parseFloat(poolAmount) / winnerCount;
  const perWinnerUsd = perWinner * tonPriceUsd;
  return {
    valid: perWinnerUsd >= 0.01,
    perWinnerUsd,
  };
}

// ─── Time Formatting ─────────────────────────────────────────────────────────

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Ended';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

// ─── Address Formatting ───────────────────────────────────────────────────────

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function bountyTypeIcon(type: string): string {
  switch (type) {
    case 'task': return '✅';
    case 'quiz': return '🧠';
    case 'creative': return '🎨';
    default: return '🏴‍☠️';
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Active';
    case 'review': return 'In Review';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'active': return 'badge-active';
    case 'review': return 'badge-review';
    case 'completed': return 'badge-completed';
    case 'cancelled': return 'badge-cancelled';
    default: return 'badge';
  }
}
