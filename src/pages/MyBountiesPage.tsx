import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';
import { BountyCard } from '../components/BountyCard';
import { useWalletStore } from '../stores/walletStore';
import { api } from '../api/client';
import { Bounty } from '../types/bounty';

export function MyBountiesPage() {
  const navigate = useNavigate();
  const { address, connected } = useWalletStore();
  const [tab, setTab] = useState<'created' | 'submitted'>('created');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    if (tab === 'created') {
      api.getUserBounties(address).then((res) => {
        setBounties(res.bounties as Bounty[]);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      api.getUserSubmissions(address).then((res) => {
        setBounties(res.submissions.map((s: any) => s.bounty));
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [address, tab]);

  if (!connected) {
    return (
      <div className="pb-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">My Bounties</h1>
            <WalletButton />
          </div>
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👛</p>
            <p className="text-[var(--text-secondary)]">Connect your wallet to see your bounties</p>
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
          <button onClick={() => setTab('created')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'created' ? 'bg-hive-500 text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'}`}>Created</button>
          <button onClick={() => setTab('submitted')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'submitted' ? 'bg-hive-500 text-white' : 'bg-[var(--bg-input)] text-[var(--text-secondary)]'}`}>Submitted</button>
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
        ) : bounties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">{tab === 'created' ? '🏴‍☠️' : '🔍'}</p>
            <p className="text-[var(--text-secondary)]">{tab === 'created' ? 'No bounties created yet' : 'No submissions yet'}</p>
            {tab === 'created' && (
              <button onClick={() => navigate('/create')} className="btn-primary mt-4">Create your first bounty</button>
            )}
          </div>
        ) : (
          bounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} onClick={() => navigate(`/bounty/${bounty.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}
