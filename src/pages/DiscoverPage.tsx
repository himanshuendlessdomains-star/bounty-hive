import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BountyCard } from '../components/BountyCard';
import { WalletButton } from '../components/WalletButton';
import { api, mapBounty } from '../api/client';
import { Bounty } from '../types/bounty';

export function DiscoverPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'task' | 'quiz' | 'creative'>('all');
  const [search, setSearch] = useState('');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getBounties({ status: 'active', type: filter === 'all' ? undefined : filter })
      .then((res) => setBounties(res.bounties.map(mapBounty)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = bounties.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-[var(--bg-primary)] z-40 p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">\uD83C\uDFF4\u200D\u2620\uFE0F BountyHive</h1>
          <WalletButton />
        </div>
        <input
          type="text"
          placeholder="Search bounties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-sm mb-3"
        />
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'task', 'quiz', 'creative'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-hive-500 text-white'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {type === 'all' ? '\uD83D\uDD25 All' : type === 'task' ? '\u2705 Task' : type === 'quiz' ? '\uD83E\uDDE0 Quiz' : '\uD83C\uDFA8 Creative'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[var(--border)] rounded w-1/2 mb-3" />
                <div className="h-5 bg-[var(--border)] rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">\u26A0\uFE0F</p>
            <p className="text-red-400 mb-2">Failed to load bounties</p>
            <p className="text-[var(--text-secondary)] text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">\uD83D\uDD0D</p>
            <p className="text-[var(--text-secondary)]">No bounties found</p>
            {bounties.length > 0 && (
              <p className="text-[var(--text-muted)] text-sm mt-1">Try a different search or filter</p>
            )}
          </div>
        )}

        {!loading && !error && filtered.map((bounty) => (
          <BountyCard
            key={bounty.id}
            bounty={bounty}
            onClick={() => navigate('/bounty/' + bounty.id)}
          />
        ))}
      </div>
    </div>
  );
}