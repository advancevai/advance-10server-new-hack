import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { NoticeModal } from './components/NoticeModal';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { PredictorPage } from './pages/PredictorPage';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NoticeModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/game/:gameId"
          element={
            <AuthGate>
              <GamePage />
            </AuthGate>
          }
        />
        <Route
          path="/game/:gameId/:category/:predictorId"
          element={
            <AuthGate>
              <PredictorPage />
            </AuthGate>
          }
        />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
