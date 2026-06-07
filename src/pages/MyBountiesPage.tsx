import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';
import { BountyCard } from '../components/BountyCard';
import { useWalletStore } from '../stores/walletStore';
import { useUserStore } from '../stores/userStore';
import { api, mapBounty } from '../api/client';
import { Bounty } from '../types/bounty';

export function MyBountiesPage() {
  const navigate = useNavigate();
  const { address, connected } = useWalletStore();
  const { userId } = useUserStore();
  const [tab, setTab] = useState<'created' | 'submitted'>('created');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use userId (DB cuid) for API calls, not wallet address
    const id = userId;
    if (!id) {
      setBounties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    if (tab === 'created') {
      api.getUserBounties(id)
        .then((res) => setBounties(res.bounties.map(mapBounty)))
        .catch((err) => { setError(err.message); setBounties([]); })
        .finally(() => setLoading(false));
    } else {
      api.getUserSubmissions(id)
        .then(async (res) => {
          const fetched: Bounty[] = [];
          for (const s of res.submissions) {
            try {
              const b = await api.getBounty(s.bountyId);
              fetched.push(mapBounty(b));
            } catch {
              // skip if bounty not found
            }
          }
          setBounties(fetched);
        })
        .catch((err) => { setError(err.message); setBounties([]); })
        .finally(() => setLoading(false));
    }
  }, [userId, tab]);

  const tabButtonClass = (isActive: boolean) =>
    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors ' +
    (isActive ? 'bg-hive-500 text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)]');

  if (!connected) {
    return (
      <div className="pb-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">My Bounties</h1>
            <WalletButton />
          </div>
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{'\uD83D\uDC5B'}</p>
            <p className="text-[var(--text-secondary)]">
              Connect your wallet to see your bounties
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-[var(--bg-primary)] z-40 p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">My Bounties</h1>
          <WalletButton />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('created')} className={tabButtonClass(tab === 'created')}>
            Created
          </button>
          <button onClick={() => setTab('submitted')} className={tabButtonClass(tab === 'submitted')}>
            Submitted
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-2" />
                <div className="h-5 bg-[var(--border)] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{tab === 'created' ? '\uD83C\uDFF4\u200D\u2620\uFE0F' : '\uD83D\uDD0D'}</p>
            <p className="text-[var(--text-secondary)]">
              {tab === 'created' ? 'No bounties created yet' : 'No submissions yet'}
            </p>
            {tab === 'created' && (
              <button onClick={() => navigate('/create')} className="btn-primary mt-4">
                Create your first bounty
              </button>
            )}
          </div>
        ) : (
          bounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              onClick={() => navigate('/bounty/' + bounty.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}