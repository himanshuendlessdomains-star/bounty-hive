import { useBountyStore } from '../stores/bountyStore';
import { BountyCard } from '../components/BountyCard';

export function MyBountiesPage() {
  const { bounties } = useBountyStore();

  // TODO: filter by current user's wallet
  const myBounties = bounties.filter((b) => b.status !== 'cancelled');

  const active = myBounties.filter((b) => b.status === 'active');
  const review = myBounties.filter((b) => b.status === 'review');
  const completed = myBounties.filter((b) => b.status === 'completed');

  return (
    <div className="px-4 pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">My Bounties</h1>

      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium mb-3">🟢 Active</h2>
          <div className="space-y-3">
            {active.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        </section>
      )}

      {review.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium mb-3">🟡 Review</h2>
          <div className="space-y-3">
            {review.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[var(--text-secondary)] text-sm font-medium mb-3">✅ Completed</h2>
          <div className="space-y-3">
            {completed.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        </section>
      )}

      {myBounties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No bounties yet</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
