import React from 'react';
import { Bounty } from '../types/bounty';
import { formatTon, formatUsd, timeAgo, bountyTypeIcon, statusColor, statusLabel } from '../utils/format';

interface BountyCardProps {
  bounty: Bounty;
  onClick?: () => void;
}

export function BountyCard({ bounty, onClick }: BountyCardProps) {
  const timeLeft = bounty.endsAt - Date.now();
  const isExpired = timeLeft <= 0;
  const isReview = bounty.status === 'review';

  return (
    <div className="card-hover" onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{bountyTypeIcon(bounty.type)}</span>
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">
            {bounty.title}
          </h3>
        </div>
        <span className={statusColor(bounty.status)}>{statusLabel(bounty.status)}</span>
      </div>

      <p className="text-[var(--text-secondary)] text-xs mb-3 line-clamp-2">
        {bounty.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-hive-500 font-bold text-lg">{formatTon(bounty.poolAmount)} TON</p>
            <p className="text-[var(--text-muted)] text-xs">≈ {formatUsd(bounty.poolUsd)}</p>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div>
            <p className="text-white font-medium text-sm">{bounty.winnerCount} winners</p>
            <p className="text-[var(--text-muted)] text-xs">
              {formatTon(bounty.perWinnerAmount)} TON each
            </p>
          </div>
        </div>

        <div className="text-right">
          {isExpired ? (
            <span className="text-[var(--text-muted)] text-xs">Ended</span>
          ) : isReview ? (
            <span className="text-yellow-400 text-xs font-medium">In Review</span>
          ) : (
            <span className="text-hive-500 text-xs font-medium">
              {Math.floor(timeLeft / 3600000)}h left
            </span>
          )}
          {bounty.submissions?.length > 0 && (
            <p className="text-[var(--text-muted)] text-xs mt-0.5">
              {bounty.submissions.length} submission{bounty.submissions.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border)]">
        <span className={statusColor(bounty.winnerSelection === 'draw' ? 'active' : 'review')}>
          {bounty.winnerSelection === 'draw' ? '🎲 Draw' : '✋ Manual'}
        </span>
        <span className={statusColor(bounty.verification === 'auto' ? 'completed' : 'review')}>
          {bounty.verification === 'auto' ? '⚡ Auto' : '👁 Manual'}
        </span>
      </div>
    </div>
  );
}
