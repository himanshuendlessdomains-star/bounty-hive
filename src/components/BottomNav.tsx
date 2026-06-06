import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Discover', icon: '🔍' },
  { path: '/create', label: 'Create', icon: '🏴‍☠️' },
  { path: '/my', label: 'My Bounties', icon: '📋' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${isActive ? 'text-hive-500' : 'text-[var(--text-muted)] hover:text-white'}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
