import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { DiscoverPage } from './pages/DiscoverPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { CreateBountyPage } from './pages/CreateBountyPage';
import { MyBountiesPage } from './pages/MyBountiesPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="max-w-lg mx-auto min-h-screen bg-[var(--bg-primary)]">
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
