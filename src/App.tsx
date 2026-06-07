import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { DiscoverPage } from './pages/DiscoverPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { CreateBountyPage } from './pages/CreateBountyPage';
import { MyBountiesPage } from './pages/MyBountiesPage';

const BOT_URL = import.meta.env.VITE_TELEGRAM_BOT_URL || 'https://t.me/bountyhive24_bot/bountyhive24';

function TelegramGate() {
  // Check if running inside Telegram WebApp (not just initData)
  const twa = (window as any).Telegram?.WebApp;
  if (twa) return null; // Inside Telegram — no gate

  // Outside Telegram — show friendly landing
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] px-8 text-center">
      <div className="mb-6 text-6xl">🏴‍☠️</div>
      <h1 className="mb-3 text-2xl font-bold text-white">BountyHive</h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-400 max-w-xs">
        Micro-bounties on TON. Open this link inside Telegram to use the app.
      </p>
      <a
        href={BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl bg-[#22c55e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#16a34a] transition-colors"
      >
        Open in Telegram
      </a>
    </div>
  );
}

function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const twa = (window as any).Telegram?.WebApp;
    const startParam: string =
      twa?.initDataUnsafe?.start_param ??
      new URLSearchParams(window.location.search).get('startapp') ??
      new URLSearchParams(window.location.hash.slice(1)).get('startapp') ??
      '';

    if (startParam.startsWith('bounty_')) {
      navigate(`/bounty/${startParam.slice(7)}`, { replace: true });
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <TelegramGate />
        <div className="max-w-lg mx-auto min-h-screen bg-[var(--bg-primary)]">
          <DeepLinkHandler />
          <Routes>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/bounty/:id" element={<BountyDetailPage />} />
            <Route path="/create" element={<CreateBountyPage />} />
            <Route path="/my" element={<MyBountiesPage />} />
          </Routes>
          <BottomNav />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
