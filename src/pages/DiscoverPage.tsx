import { useBountyStore } from '../stores/bountyStore';
import { BountyCard } from '../components/BountyCard';

export function DiscoverPage() {
  const { bounties, isLoading } = useBountyStore();

  const activeBounties = bounties.filter((b) => b.status === 'active');

  return (
    <div className="px-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🏴‍☠️ BountyHive</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-hive-500 border-t-transparent" />
        </div>
      ) : activeBounties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)] text-lg">No active bounties yet</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  );
}
