import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { DiscoverPage } from './pages/DiscoverPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { CreateBountyPage } from './pages/CreateBountyPage';
import { MyBountiesPage } from './pages/MyBountiesPage';

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
