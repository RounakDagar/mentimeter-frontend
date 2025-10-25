// src/App.js
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import JoinSessionPage from './pages/JoinSessionPage';
import HostSessionPage from './pages/HostSessionPage';
import ParticipantSessionPage from './pages/ParticipantSessionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HostedQuizzesPage from './pages/HostedQuizzesPage';
import HostedQuizAnalyticsPage from './pages/HostedQuizAnalyticsPage';
import EditQuizPage from './pages/EditQuizPage';
import AsyncAttemptPage from './pages/AsyncAttemptPage';
import AsyncAnalyticsPage from './pages/AsyncAnalyticsPage';
import { ThemeProvider } from './context/ThemeContext';
import { Users, Loader2 } from 'lucide-react';
import AsyncResultPage from './pages/AsyncResultPage';


const parsePath = (path) => {
  
  const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  if (cleanPath === '/register') {
    return { page: 'register', props: {} };
  }
  if (cleanPath === '/login' || cleanPath === '/') {
    
    return { page: 'login', props: {} }; // AuthRouter will handle redirect if logged in
  }
  if (cleanPath.startsWith('/attempt/')) {
    const shareCode = cleanPath.split('/attempt/')[1];
    if (shareCode) {
      // Return page and props needed for AsyncAttemptPage
      return { page: 'asyncAttempt', props: { shareCode } };
    }
  }
  return { page: 'dashboard', props: {} };
};

export default function App() {
  // --- Initialize state based on the current URL path ---
  const [initialRoute] = useState(() => parsePath(window.location.pathname));
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [pageProps, setPageProps] = useState(initialRoute.props);
  // ---------------------------------------------------

  // --- Handle browser back/forward navigation ---
  useEffect(() => {
    const handlePopState = (event) => {
      // event.state usually holds the props we pushed earlier
      const newRoute = parsePath(window.location.pathname);
      console.log("PopState detected:", newRoute, "State:", event.state);
      setCurrentPage(newRoute.page);
      // Use state from history if available, otherwise use parsed props
      setPageProps(event.state || newRoute.props);
    };

    window.addEventListener('popstate', handlePopState);
    // Cleanup listener on component unmount
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Empty dependency array means this runs only once on mount
  // --------------------------------------------

  // --- Navigation function used by child components ---
  const navigate = (page, props = {}) => {
    console.log("Navigating (internal) to:", page, "with props:", props);
    setCurrentPage(page);
    setPageProps(props);

    // Update the browser URL bar using the History API
    let path = `/${page}`; // Base path
    if (page === 'asyncAttempt' && props.shareCode) {
      path = `/attempt/${props.shareCode}`;
    } else if (page === 'dashboard') {
      path = '/'; // Use root path for dashboard
    } else if (page === 'login' || page === 'register') {
      path = `/${page}`;
    }
    // Add other specific path constructions here if needed (e.g., /edit-quiz/quizId)

    // Push state into history, including the props
    window.history.pushState(props, '', path);
  };
  // --------------------------------------------------

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthRouter currentPage={currentPage} pageProps={pageProps} onNavigate={navigate} />
      </AuthProvider>
    </ThemeProvider>
  );
}

// --- Component to handle routing based on auth status and currentPage ---
const AuthRouter = ({ currentPage, pageProps, onNavigate }) => {
  const { user, loading } = useAuth();

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-lg font-medium">Loading Application...</p>
        </div>
      </div>
    );
  }

  // --- Public Routes Logic ---
  const publicPages = ['login', 'register'];
  const isPublicPage = publicPages.includes(currentPage);

  if (!user) {
    // If user is not logged in, only allow access to public pages
    if (isPublicPage) {
      if (currentPage === 'register') {
        return <RegisterPage onNavigate={onNavigate} />;
      }
      return <LoginPage onNavigate={onNavigate} />; // Default public page is login
    } else {
      // Trying to access a protected page (like /attempt/ or /dashboard) while logged out
      // Force redirect to login
      console.log("User not logged in, redirecting to login from:", currentPage);
      // Render LoginPage directly instead of calling navigate to avoid state issues during render
      return <LoginPage onNavigate={onNavigate} />;
    }
  }

  // --- User is Logged In ---

  // If user is logged in but tries to access login/register, redirect to dashboard
  if (isPublicPage) {
     console.log("User logged in, redirecting from public page to dashboard.");
     // Render Dashboard directly
     return <Dashboard onNavigate={onNavigate} />;
  }

  // --- Protected Routes Logic ---
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} />;
    case 'join':
      return <JoinSessionPage onNavigate={onNavigate} />;
    case 'host':
      // Pass props needed for hosting (joinCode, quizId)
      return <HostSessionPage {...pageProps} onNavigate={onNavigate} />;
    case 'participant':
      // Pass props needed for participating (joinCode, username)
      return <ParticipantSessionPage {...pageProps} onNavigate={onNavigate} />;
    case 'analytics':
      // Pass props needed for analytics (sessionId, quizTitle, etc.)
      return <AnalyticsPage {...pageProps} onNavigate={onNavigate} />;
    case 'edit-quiz':
      // Pass props needed for editing (quizId)
      return <EditQuizPage {...pageProps} onNavigate={onNavigate} />;
    
    case 'hostedQuizAnalytics':
      // <-- CHANGED: Use spread operator {...pageProps}
      return <HostedQuizAnalyticsPage {...pageProps} onNavigate={onNavigate} />;
    
    case 'asyncAttempt':
      // <-- CHANGED: Use spread operator {...pageProps}
      return <AsyncAttemptPage {...pageProps} onNavigate={onNavigate} />;
    
    case 'asyncAnalytics':
      // <-- CHANGED: Use spread operator {...pageProps}
      return <AsyncAnalyticsPage {...pageProps} onNavigate={onNavigate} />;
    case 'asyncResult':
      return <AsyncResultPage {...pageProps} onNavigate={onNavigate} />;

    

    default: // Unknown page, default to dashboard for logged-in users
      console.warn("Unknown page:", currentPage, "Defaulting to dashboard.");
      return <Dashboard onNavigate={onNavigate} />;
  }
};