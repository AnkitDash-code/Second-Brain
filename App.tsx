import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Capture from './pages/Capture';
import Recall from './pages/Recall';
import Stories from './pages/Stories';
import Insights from './pages/Insights';
import Onboarding from './pages/Onboarding';

const App: React.FC = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('onboarding_complete') === 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setIsOnboardingComplete(true);
  };

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/recall" element={<Recall />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;