import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BountyCard } from '../components/BountyCard';
import { WalletButton } from '../components/WalletButton';
import { api } from '../api/client';
import { Bounty, BountyType } from '../types/bounty';

export function DiscoverPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'task' | 'quiz' | 'creative'>('all');
  const [search, setSearch] = useState('');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    api
      .getBounties({ status: 'active', type: filter === 'all' ? undefined : filter })
      .then((res) => {
        setBounties(res.bounties as Bounty[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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
          <h1 className="text-xl font-bold text-white">🏴‍☠️ BountyHive</h1>
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
              {type === 'all' ? '🔥 All' : type === 'task' ? '✅ Task' : type === 'quiz' ? '🧠 Quiz' : '🎨 Creative'}
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
            <p className="text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary mt-2">Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-[var(--text-secondary)]">No bounties found</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">Be the first to create one!</p>
          </div>
        )}

        {filtered.map((bounty) => (
          <BountyCard
            key={bounty.id}
            bounty={bounty}
            onClick={() => navigate(`/bounty/${bounty.id}`)}
          />
        ))}

        {filtered.length > 0 && (
          <p className="text-[var(--text-muted)] text-xs text-center pt-2">
            Showing {filtered.length} bounties
          </p>
        )}
      </div>
    </div>
  );
}
