
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BotsPage from './pages/BotsPage';
import BotProfile from './pages/BotProfile';
import TradeDetails from './pages/TradeDetails';
import PortfolioPage from './pages/PortfolioPage';
import TradesPage from './pages/TradesPage';
import ChartCenterPage from './pages/ChartCenterPage';
import ReporterPage from './pages/ReporterPage';
import MorePage from './pages/MorePage';
import TimeMachinePage from './pages/TimeMachinePage';
import LivePage from './pages/LivePage';
import NewsPage from './pages/NewsPage';
import VerificationPage from './pages/VerificationPage';
import DesignGallery from './pages/DesignGallery';
import ActivityPage from './pages/ActivityPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bots" element={<BotsPage />} />
        <Route path="/bot/:botId" element={<BotProfile />} />
        <Route path="/trade/:tradeId" element={<TradeDetails />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/charts" element={<ChartCenterPage />} />
        <Route path="/reporter" element={<ReporterPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/time-machine" element={<TimeMachinePage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/design-gallery" element={<DesignGallery />} />

        {/* Fallback routes */}
        <Route path="/settings" element={<MorePage />} />
        <Route path="/help" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
