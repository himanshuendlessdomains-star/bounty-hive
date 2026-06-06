import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { DiscoverPage } from './pages/DiscoverPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { CreateBountyPage } from './pages/CreateBountyPage';
import { MyBountiesPage } from './pages/MyBountiesPage';

const isTelegram = !!(window as any).Telegram?.WebApp?.initData;
const BOT_URL = import.meta.env.VITE_TELEGRAM_BOT_URL ?? 'https://t.me/BountyHiveBot';

function TelegramGate() {
  if (isTelegram) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f0f] px-8 text-center">
      <div className="mb-6 text-6xl">✈️</div>
      <h1 className="mb-3 text-2xl font-bold text-white">Open in Telegram</h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-400">
        BountyHive is a Telegram Mini App. It can't run in a regular browser —
        please open it through the Telegram bot.
      </p>
      <a
        href={BOT_URL}
        className="rounded-xl bg-[#229ED9] px-6 py-3 text-sm font-semibold text-white"
      >
        Open BountyHive in Telegram
      </a>
    </div>
  );
}

function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const startParam: string =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param ??
      new URLSearchParams(window.location.search).get('startapp') ??
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
