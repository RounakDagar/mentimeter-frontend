import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, ChevronRight, LogOut, Menu, X, Sun, Moon, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import { useTheme } from '../context/ThemeContext';
import CreateQuizModal from './CreateQuizModal';
import HostedQuizzesPage from './HostedQuizzesPage';

// ## New Component: SkeletonCard ##
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent dark:bg-slate-800">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 dark:bg-slate-700"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-slate-700"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4 mt-4 dark:bg-slate-700"></div>
    </div>
  </div>
);

const Dashboard = ({ onNavigate }) => {
  const [tab, setTab] = useState('hosted');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const { apiCall } = useAPI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // ## Fetch for "My Quizzes" (un-hosted) ##
  useEffect(() => {
    if (user?.username) {
      (async () => {
        setLoadingMyQuizzes(true);
        try {
          // --- THIS IS THE CORRECTED LINE ---
          const url = `/quiz/user/${user.username}`; // Fetches original quizzes
          // ---------------------------------
          const data = await apiCall(url, { method: 'GET' });
          setMyQuizzes(data || []);
        } catch (err) {
          console.error("Failed to fetch user's quizzes:", err);
          setMyQuizzes([]);
        } finally {
          setLoadingMyQuizzes(false);
        }
      })();
    }
  }, [user, apiCall]); // Dependency array is correct

  // Fetch for "Attempted Quizzes"
  useEffect(() => {
    if (tab === 'attempted' && user?.username) {
      (async () => {
        try {
          const url = `/quiz/${user.username}/AttemptedQuiz`;
          const data = await apiCall(url, { method: 'GET' });
          setAttemptedQuizzes(data || []);
        } catch (err) {
          setAttemptedQuizzes([]);
        }
      })();
    }
  }, [tab, user, apiCall]);


  // ## This card is for the "My Quizzes" section ##
  const QuizCard = ({ quiz, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 cursor-pointer border-2 border-transparent hover:border-indigo-500 dark:bg-slate-800 dark:hover:border-indigo-500"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{quiz.title}</h3>
      <p className="text-gray-600 mb-4 dark:text-slate-400 flex items-center">
        <ListChecks className="w-4 h-4 mr-2" />
        {quiz.questionList?.length || 0} questions
      </p>
      <button className="text-indigo-600 font-medium flex items-center dark:text-indigo-400">
        Start Session <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );

  const handleCreateQuiz = () => setShowCreateModal(true);

  const handleStartSession = async (quizId) => {
    try {
      const response = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({ quizId })
      });
      onNavigate('host', { joinCode: response.joinCode, quizId });
    } catch (err) {
      alert('Failed to create session');
    }
  };

  const handleViewAnalytics = (attempt) => {
    const isHost = attempt.hostUsername === user.username;
    onNavigate('analytics', {
      sessionId: attempt.sessionId,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      isHost
    });
  };

  const AttemptedQuizCard = ({ attempt }) => (
    <div
      className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent mb-4 cursor-pointer hover:border-indigo-500 dark:bg-slate-800 dark:hover:border-indigo-500"
      onClick={() => handleViewAnalytics(attempt)}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{attempt.quizTitle}</h3>
      <p className="text-gray-600 mb-1 dark:text-slate-400">Score: {attempt.score} / {attempt.totalQuestions}</p>
      <p className="text-gray-600 mb-1 dark:text-slate-400">Attempted At: {new Date(attempt.attemptedAt).toLocaleString()}</p>
      <p className="text-gray-600 mb-1 dark:text-slate-400">Session ID: {attempt.sessionId}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b dark:bg-slate-800 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* ... (Header logo) ... */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">MentiMeter</h1>
            </div>
            
            {/* ... (Desktop nav with Theme Toggle) ... */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700 dark:text-slate-300">Welcome, {user?.username}</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-500 dark:hover:bg-red-900/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            {/* ... (Mobile menu button) ... */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b p-4 dark:bg-slate-800 dark:border-slate-700">
          {/* ... (Mobile menu content with Theme Toggle) ... */}
          <div className="space-y-2">
            <div className="text-gray-700 py-2 dark:text-slate-300">Welcome, {user?.username}</div>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-500 dark:hover:bg-red-900/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Dashboard</h2>
            <p className="text-gray-600 mt-1 dark:text-slate-400">Create, host, and join quizzes all from here.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCreateQuiz}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('join')}
              className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition dark:bg-slate-800 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-slate-700"
            >
              Join Quiz
            </button>
          </div>
        </div>

        {/* ## NEW SECTION: "My Quizzes (Ready to Host)" ## */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">My Quizzes (Ready to Host)</h3>
          {loadingMyQuizzes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : myQuizzes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800 border dark:border-slate-700">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">No quizzes created yet</h3>
              <p className="text-gray-600 mb-6 dark:text-slate-400">Click "Create Quiz" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myQuizzes.map(quiz => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onClick={() => handleStartSession(quiz.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-8 dark:border-slate-700">
          <button
            className={`px-4 py-2 font-semibold ${tab === 'hosted' ? 'border-b-4 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'}`}
            onClick={() => setTab('hosted')}
          >
            Hosted History {/* RENAMED for clarity */}
          </button>
          <button
            className={`px-4 py-2 font-semibold ${tab === 'attempted' ? 'border-b-4 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'}`}
            onClick={() => setTab('attempted')}
          >
            Attempted Quizzes
          </button>
        </div>
      </div>

      {/* Main Content (Tabs) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {tab === 'hosted' ? (
          <HostedQuizzesPage user={user} onNavigate={onNavigate} />
        ) : (
          <>
            {attemptedQuizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">No attempted quizzes yet</h3>
                <p className="text-gray-600 mb-6 dark:text-slate-400">Try participating in a quiz!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attemptedQuizzes.map(attempt => (
                  <AttemptedQuizCard key={attempt.id} attempt={attempt} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(quiz) => {
            setMyQuizzes([...myQuizzes, quiz]); 
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;