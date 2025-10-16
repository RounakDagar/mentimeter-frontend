import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import JoinSessionPage from './pages/JoinSessionPage';
import HostSessionPage from './pages/HostSessionPage';
import ParticipantSessionPage from './pages/ParticipantSessionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { Users } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [pageProps, setPageProps] = useState({});

  const navigate = (page, props = {}) => {
    setCurrentPage(page);
    setPageProps(props);
  };

  return (
    <AuthProvider>
      <AuthRouter currentPage={currentPage} pageProps={pageProps} onNavigate={navigate} />
    </AuthProvider>
  );
}

const AuthRouter = ({ currentPage, pageProps, onNavigate }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes
  if (!user) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={onNavigate} />;
    }
    return <LoginPage onNavigate={onNavigate} />;
  }

  // Protected routes
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} />;
    case 'join':
      return <JoinSessionPage onNavigate={onNavigate} />;
    case 'host':
      return <HostSessionPage {...pageProps} onNavigate={onNavigate} />;
    case 'participant':
      return <ParticipantSessionPage {...pageProps} onNavigate={onNavigate} />;
    case 'analytics':
      return <AnalyticsPage {...pageProps} onNavigate={onNavigate} />;
    default:
      return <Dashboard onNavigate={onNavigate} />;
  }
};