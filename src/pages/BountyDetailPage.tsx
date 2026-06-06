import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEscrowContract } from '../hooks/useEscrowContract';
import { CountdownTimer } from '../components/CountdownTimer';
import { WalletButton } from '../components/WalletButton';
import { api } from '../api/client';
import { Bounty } from '../types/bounty';
import { formatTon, formatUsd, statusColor, statusLabel, bountyTypeIcon } from '../utils/format';

export function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bounty, setBounty] = React.useState<Bounty | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [proofUrl, setProofUrl] = React.useState('');
  const { submitProof, loading: escrowLoading } = useEscrowContract(bounty?.escrowAddress ?? null);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getBounty(id)
      .then((res) => setBounty(res.bounty as Bounty))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="card animate-pulse">
          <div className="h-6 bg-[var(--border)] rounded w-3/4 mb-4" />
          <div className="h-4 bg-[var(--border)] rounded w-1/2 mb-2" />
          <div className="h-4 bg-[var(--border)] rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="p-4 pb-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-[var(--text-secondary)]">Bounty not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Go back</button>
      </div>
    );
  }

  const isActive = bounty.status === 'active';

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-[var(--bg-primary)] z-40 p-4 border-b border-[var(--border)] flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[var(--text-secondary)] hover:text-white">
          ← Back
        </button>
        <WalletButton />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{bountyTypeIcon(bounty.type)}</span>
            <div>
              <h1 className="text-lg font-bold text-white">{bounty.title}</h1>
              <span className={statusColor(bounty.status)}>{statusLabel(bounty.status)}</span>
            </div>
          </div>
        </div>

        <p className="text-[var(--text-secondary)] text-sm">{bounty.description}</p>

        <div className="card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[var(--text-muted)] text-xs">Pool</p>
              <p className="text-hive-500 font-bold text-lg">{formatTon(bounty.poolAmount)} TON</p>
              <p className="text-[var(--text-muted)] text-xs">≈ {formatUsd(bounty.poolUsd)}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Per Winner</p>
              <p className="text-white font-bold text-lg">{formatTon(bounty.perWinnerAmount)} TON</p>
              <p className="text-[var(--text-muted)] text-xs">≈ {formatUsd(bounty.perWinnerUsd)}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Winners</p>
              <p className="text-white font-medium">{bounty.winnerCount}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Selection</p>
              <p className="text-white font-medium">{bounty.winnerSelection === 'draw' ? '🎲 Random' : '✋ Manual'}</p>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="card">
            <CountdownTimer targetDate={bounty.endsAt} size="lg" />
          </div>
        )}

        {isActive && (
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Submit Proof</h3>
            <input
              type="url"
              placeholder="Paste your proof URL (screenshot, link, etc.)"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="input-field text-sm mb-3"
            />
            <button
              onClick={() => submitProof(proofUrl)}
              disabled={!proofUrl || escrowLoading}
              className="btn-primary w-full"
            >
              {escrowLoading ? 'Submitting...' : 'Submit Proof'}
            </button>
          </div>
        )}

        {bounty.submissions && bounty.submissions.length > 0 && (
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Submissions ({bounty.submissions.length})</h3>
            <div className="space-y-2">
              {bounty.submissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-xs">
                      {sub.user?.displayName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm">{sub.user?.displayName || 'Anonymous'}</p>
                      <p className="text-[var(--text-muted)] text-xs">{sub.proofUrl.slice(0, 40)}...</p>
                    </div>
                  </div>
                  <span className={statusColor(sub.status)}>{statusLabel(sub.status)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          <span>Created by {bounty.owner?.displayName || 'Unknown'}</span>
          <span>•</span>
          <span>{bounty.verification === 'auto' ? '⚡ Auto-verified' : '👁 Manual review'}</span>
          <span>•</span>
          <span>1% fee</span>
        </div>
      </div>
    </div>
  );
}
