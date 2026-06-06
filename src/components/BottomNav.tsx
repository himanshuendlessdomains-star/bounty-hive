import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Discover', icon: '🔍' },
  { to: '/create', label: 'Create', icon: '➕' },
  { to: '/my-bounties', label: 'My Bounties', icon: '🏴‍☠️' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex justify-around py-2 px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs transition-colors ${
              isActive ? 'text-hive-400' : 'text-[var(--text-secondary)]'
            }`
          }
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
