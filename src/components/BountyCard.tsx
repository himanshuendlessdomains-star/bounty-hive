import type { Bounty } from '../types/bounty';
import { formatTon, formatUsd } from '../utils/format';
import { CountdownTimer } from './CountdownTimer';

interface BountyCardProps {
  bounty: Bounty;
  onClick?: () => void;
}

const typeIcons: Record<string, string> = {
  task: '✅',
  quiz: '🧠',
  creative: '🎨',
};

export function BountyCard({ bounty, onClick }: BountyCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 text-left hover:border-hive-500/50 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">
          {typeIcons[bounty.type] ?? '🏴‍☠️'}
        </span>
        <CountdownTimer endTime={bounty.endsAt} size="sm" />
      </div>

      <h3 className="text-white font-semibold text-base mb-1 truncate">
        {bounty.title}
      </h3>

      <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
        {bounty.description}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-hive-400 font-bold">{formatTon(bounty.poolAmount)} TON</span>
          <span className="text-[var(--text-secondary)] text-xs ml-1">
            {formatUsd(bounty.poolUsd)}
          </span>
        </div>
        <span className="text-[var(--text-secondary)] text-xs">
          {bounty.winnerCount} winner{bounty.winnerCount > 1 ? 's' : ''}
        </span>
      </div>
    </button>
  );
}
