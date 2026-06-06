import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useEscrowContract } from '../hooks/useEscrowContract';
import { useWalletStore } from '../stores/walletStore';
import { CountdownTimer } from '../components/CountdownTimer';
import { WalletButton } from '../components/WalletButton';
import { Bounty } from '../types/bounty';
import { formatTon, formatUsd, statusColor, statusLabel, bountyTypeIcon } from '../utils/format';

export function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address: walletAddress } = useWalletStore();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submitProof, loading: escrowLoading } = useEscrowContract(bounty?.escrowAddress ?? null);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getBounty(id)
      .then((res) => {
        setBounty(res as unknown as Bounty);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitProof = async () => {
    if (!proofUrl.trim()) return;
    setSubmitting(true);
    try {
      // Submit proof via backend
      await api.createSubmission(bounty!.id, { proofUrl, userId: walletAddress! });
      // Also submit on-chain if escrow exists
      if (bounty?.escrowAddress) {
        await submitProof(proofUrl);
      }
      // Refresh bounty
      const res = await api.getBounty(bounty!.id);
      setBounty(res as unknown as Bounty);
      setProofUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (error || !bounty) {
    return (
      <div className="p-4 pb-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-[var(--text-secondary)]">Bounty not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Go back
        </button>
      </div>
    );
  }

  const isActive = bounty.status === 'active';
  const isOwner = walletAddress === bounty.ownerId;

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-[var(--bg-primary)] z-40 p-4 border-b border-[var(--border)] flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[var(--text-secondary)] hover:text-white">
          ← Back
        </button>
        <WalletButton />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{bountyTypeIcon(bounty.type)}</span>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">{bounty.title}</h1>
            <span className={statusColor(bounty.status)}>{statusLabel(bounty.status)}</span>
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
              <p className="text-white font-medium">
                {bounty.winnerSelection === 'draw' ? '🎲 Random Draw' : '✋ Manual Pick'}
              </p>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="card">
            <CountdownTimer targetDate={bounty.endsAt} size="lg" />
          </div>
        )}

        {isActive && !isOwner && (
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
              onClick={handleSubmitProof}
              disabled={!proofUrl.trim() || submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Proof'}
            </button>
          </div>
        )}

        {bounty.submissions && bounty.submissions.length > 0 && (
          <div className="card">
            <h3 className="text-white font-semibold mb-3">
              Submissions ({bounty.submissions.length})
            </h3>
            <div className="space-y-2">
              {bounty.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-xs">
                      {sub.user?.displayName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm">{sub.user?.displayName || 'Anonymous'}</p>
                      <p className="text-[var(--text-muted)] text-xs truncate max-w-[200px]">
                        {sub.proofUrl}
                      </p>
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
