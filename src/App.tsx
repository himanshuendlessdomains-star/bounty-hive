import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TonProvider } from './providers/TonProvider';
import { DiscoverPage } from './pages/DiscoverPage';
import { BountyDetailPage } from './pages/BountyDetailPage';
import { CreateBountyPage } from './pages/CreateBountyPage';
import { MyBountiesPage } from './pages/MyBountiesPage';
import { BottomNav } from './components/BottomNav';

export default function App() {
  return (
    <TonProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--bg-primary)]">
          <Routes>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/bounty/:id" element={<BountyDetailPage />} />
            <Route path="/create" element={<CreateBountyPage />} />
            <Route path="/my-bounties" element={<MyBountiesPage />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TonProvider>
  );
}
