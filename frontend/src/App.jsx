
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

import ActivityPage from './pages/ActivityPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import LiveChartPage from './pages/LiveChartPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import RobotStatusPage from './pages/RobotStatusPage';
import LiveEventsPage from './pages/LiveEventsPage';
import NotificationBell from './components/NotificationBell';

function App() {
  // System Notification Setup
  React.useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Keep-Alive System - Prevents backend from sleeping on Render
  React.useEffect(() => {
    const keepAlive = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/health`);
        console.log('⚡ Keep-alive ping sent');
      } catch (error) {
        console.warn('Keep-alive failed:', error);
      }
    };

    // Ping immediately on load
    keepAlive();

    // Then ping every 5 minutes (300000ms)
    const interval = setInterval(keepAlive, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <NotificationBell />
      <Routes>
        <Route path="/" element={<Navigate to="/live" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bots" element={<BotsPage />} />
        <Route path="/bot/:botId" element={<BotProfile />} />
        <Route path="/trade/:tradeId" element={<TradeDetails />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/charts" element={<ChartCenterPage />} />
        <Route path="/live-chart" element={<LiveChartPage />} />
        <Route path="/reporter" element={<ReporterPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/time-machine" element={<TimeMachinePage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/robot-status" element={<RobotStatusPage />} />
        <Route path="/live-events" element={<LiveEventsPage />} />
        <Route path="/verification" element={<VerificationPage />} />

        {/* Fallback routes */}
        <Route path="/settings" element={<MorePage />} />
        <Route path="/help" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
