import { useBountyStore } from '../stores/bountyStore';
import { CountdownTimer } from '../components/CountdownTimer';
import { formatTon, formatUsd } from '../utils/format';

export function BountyDetailPage() {
  const { currentBounty: bounty } = useBountyStore();

  if (!bounty) return null;

  return (
    <div className="px-4 pb-20">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium bg-hive-500/20 text-hive-400 px-2 py-1 rounded-full">
            {bounty.type.toUpperCase()}
          </span>
          <CountdownTimer endTime={bounty.endsAt} />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">{bounty.title}</h1>
        <p className="text-[var(--text-secondary)] text-sm">{bounty.description}</p>
      </div>

      {/* Prize Pool */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-4">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] text-xs mb-1">Prize Pool</p>
          <p className="text-3xl font-bold text-hive-400">
            {formatTon(bounty.poolAmount)} TON
          </p>
          <p className="text-[var(--text-secondary)] text-sm">
            {formatUsd(bounty.poolUsd)}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-[var(--text-secondary)] text-xs">Winners</p>
            <p className="text-white font-semibold">{bounty.winnerCount}</p>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-xs">Each gets</p>
            <p className="text-white font-semibold">
              {formatTon(bounty.perWinnerAmount)} TON
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 mb-4">
        <h3 className="text-white font-semibold mb-3">Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Selection</span>
            <span className="text-white">{bounty.winnerSelection === 'draw' ? '🎲 Random Draw' : '👆 Manual'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Verification</span>
            <span className="text-white">{bounty.verification === 'manual' ? '👁 Manual Review' : '🤖 Auto'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Duration</span>
            <span className="text-white">24 hours</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button className="w-full bg-hive-500 hover:bg-hive-600 text-black font-bold py-4 rounded-2xl text-lg transition-colors">
        Submit Proof 🏴‍☠️
      </button>
    </div>
  );
}
