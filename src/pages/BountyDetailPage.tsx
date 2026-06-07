import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, BountyResponse } from '../api/client';
import { useEscrowContract } from '../hooks/useEscrowContract';
import { useWalletStore } from '../stores/walletStore';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../components/Toast';
import { CountdownTimer } from '../components/CountdownTimer';
import { WalletButton } from '../components/WalletButton';
import { formatTon, formatUsd, statusColor, statusLabel, bountyTypeIcon } from '../utils/format';

export function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address: walletAddress } = useWalletStore();
  const { userId } = useUserStore();
  const { addToast } = useToast();
  const [bounty, setBounty] = useState<BountyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submitProof: submitOnChain } = useEscrowContract(bounty?.escrowAddress ?? null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .getBounty(id)
      .then((res) => setBounty(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitProof = async () => {
    if (!proofUrl.trim() || !bounty) return;
    setSubmitting(true);
    try {
      await api.submitProof({ bountyId: bounty.id, proofUrl });
      if (bounty.escrowAddress) {
        await submitOnChain(proofUrl);
      }
      const res = await api.getBounty(bounty.id);
      setBounty(res);
      setProofUrl('');
      addToast('success', 'Proof submitted!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(msg);
      addToast('error', msg);
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
        <p className="text-[var(--text-secondary)]">{error || 'Bounty not found'}</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Go back</button>
      </div>
    );
  }

  const isActive = bounty.status === 'active';
  const isOwner = userId === bounty.ownerId;
  const hasSubmitted = bounty.submissions?.some(
    (s) => s.userId === userId
  );

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-[var(--bg-primary)] z-40 p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[var(--text-secondary)] hover:text-white">← Back</button>
          <WalletButton />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="card">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{bountyTypeIcon(bounty.type as any)}</span>
              <h1 className="text-lg font-bold text-white">{bounty.title}</h1>
            </div>
            <span className={statusColor(bounty.status as any)}>{statusLabel(bounty.status as any)}</span>
          </div>

          {bounty.owner && (
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              by {bounty.owner.displayName || bounty.owner.username || 'Anonymous'}
            </p>
          )}

          <p className="text-[var(--text-secondary)] text-sm mb-4">{bounty.description}</p>

          {/* Pool info */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-hive-500 font-bold text-2xl">{formatTon(bounty.poolAmount)} TON</p>
              <p className="text-[var(--text-muted)] text-xs">≈ {formatUsd(bounty.poolUsd)}</p>
            </div>
            <div className="h-10 w-px bg-[var(--border)]" />
            <div>
              <p className="text-white font-medium">{bounty.winnerCount} winners</p>
              <p className="text-[var(--text-muted)] text-xs">{formatTon(bounty.perWinnerAmount)} TON each</p>
            </div>
          </div>

          {/* Countdown */}
          {isActive && (
            <CountdownTimer targetDate={new Date(bounty.endsAt).getTime()} size="lg" />
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Type</span>
              <span className="text-white capitalize">{bounty.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Selection</span>
              <span className="text-white capitalize">{bounty.winnerSelection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Verification</span>
              <span className="text-white capitalize">{bounty.verification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Platform fee</span>
              <span className="text-white">{bounty.platformFeeBps / 100}%</span>
            </div>
          </div>
        </div>

        {/* Submissions */}
        {bounty.submissions && bounty.submissions.length > 0 && (
          <div className="card">
            <h3 className="text-white font-semibold mb-3">
              Submissions ({bounty.submissions.length})
            </h3>
            <div className="space-y-2">
              {bounty.submissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-xs">
                      {(s.user?.displayName || s.user?.username || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm">{s.user?.displayName || s.user?.username || 'Anonymous'}</p>
                      <p className="text-[var(--text-muted)] text-xs">{new Date(s.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    s.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    s.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit proof */}
        {isActive && !isOwner && !hasSubmitted && walletAddress && (
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Submit your proof</h3>
            <input
              type="url"
              placeholder="Link to your proof (screenshot, tweet, etc.)"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="input-field mb-3"
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

        {/* Owner actions */}
        {isOwner && (
          <div className="card">
            <h3 className="text-white font-semibold mb-3">Owner Actions</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              You created this bounty. Manage submissions below.
            </p>
            {bounty.submissions && bounty.submissions.length > 0 && (
              <div className="space-y-2">
                {bounty.submissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex-1">
                      <p className="text-white text-sm">{s.user?.displayName || s.user?.username || 'Anonymous'}</p>
                      <a href={s.proofUrl} target="_blank" rel="noopener" className="text-hive-500 text-xs hover:underline">{s.proofUrl}</a>
                    </div>
                    {s.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await api.updateSubmission(s.id, 'approved');
                              setBounty(await api.getBounty(bounty.id));
                              addToast('success', 'Approved!');
                            } catch (err: any) {
                              addToast('error', err.message);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api.updateSubmission(s.id, 'rejected');
                              setBounty(await api.getBounty(bounty.id));
                              addToast('success', 'Rejected');
                            } catch (err: any) {
                              addToast('error', err.message);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}