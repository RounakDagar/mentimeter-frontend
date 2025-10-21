import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, ChevronRight, LogOut, Menu, X, Sun, Moon, ListChecks, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
import { useAPI } from '../hooks/useAPI'; // Ensure this path is correct
import { useTheme } from '../context/ThemeContext'; // Ensure this path is correct
import CreateQuizModal from './CreateQuizModal'; // Ensure this path is correct
import HostedQuizzesPage from './HostedQuizzesPage'; // Ensure this path is correct

// ## Component: SkeletonCard ## (For loading states)
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent dark:bg-slate-800">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 dark:bg-slate-700"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-slate-700"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4 mt-4 dark:bg-slate-700"></div>
    </div>
  </div>
);

// ## Component: ConfirmationModal ## (For delete confirmation)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md text-center">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-4 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ## Component: Dashboard ##
const Dashboard = ({ onNavigate }) => {
  // State variables
  const [tab, setTab] = useState('hosted'); // Tracks current tab ('hosted' history or 'attempted' quizzes)
  const [myQuizzes, setMyQuizzes] = useState([]); // List of quizzes created by the user
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true); // Loading state for "My Quizzes"
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]); // List of quizzes attempted by the user
  const [showCreateModal, setShowCreateModal] = useState(false); // Visibility state for the Create Quiz modal
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu toggle

  // State for delete confirmation
  const [quizToDeleteId, setQuizToDeleteId] = useState(null); // ID of the quiz queued for deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Visibility state for the delete modal
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false); // Loading state during quiz deletion

  // Hooks
  const { user, logout } = useAuth(); // Authentication context
  const { apiCall } = useAPI(); // Custom hook for making API calls
  const { theme, toggleTheme } = useTheme(); // Theme context

  // Effect to fetch user's created quizzes
  useEffect(() => {
    if (user?.username) {
      (async () => {
        setLoadingMyQuizzes(true);
        try {
          const url = `/quiz/user/${user.username}`;
          const data = await apiCall(url, { method: 'GET' });
          // ## MODIFICATION: Reverse the array before setting state ##
          setMyQuizzes(Array.isArray(data) ? data.slice().reverse() : []);
        } catch (err) {
          console.error("Failed to fetch user's quizzes:", err);
          setMyQuizzes([]);
          // TODO: Add user-facing error feedback
        } finally {
          setLoadingMyQuizzes(false);
        }
      })();
    }
  }, [user, apiCall]); // Dependencies: Refetch if user or apiCall function changes

  // Effect to fetch user's attempted quizzes when the 'attempted' tab is active
  useEffect(() => {
    if (tab === 'attempted' && user?.username) {
      (async () => {
        try {
          const url = `/quiz/${user.username}/AttemptedQuiz`; // Endpoint should match backend route
          const data = await apiCall(url, { method: 'GET' });
          setAttemptedQuizzes(data || []);
        } catch (err) {
          console.error("Failed to fetch attempted quizzes:", err);
          setAttemptedQuizzes([]);
          // TODO: Add user-facing error feedback
        }
      })();
    }
  }, [tab, user, apiCall]); // Dependencies: Refetch if tab, user, or apiCall changes

  // ## Component: QuizCard ## (Represents a single quiz in the "My Quizzes" list)
  const QuizCard = ({ quiz, onStartClick, onDeleteClick }) => (
    <div
      className="relative group bg-white rounded-xl shadow-md p-6 border-2 border-transparent dark:bg-slate-800 transition-shadow hover:shadow-lg" // Added hover shadow
    >
      {/* Delete Button (visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering onStartClick
          onDeleteClick();
        }}
        className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
        aria-label="Delete quiz"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Clickable Card Content */}
      <div onClick={onStartClick} className="cursor-pointer">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{quiz.title}</h3>
        <p className="text-gray-600 mb-4 dark:text-slate-400 flex items-center text-sm"> {/* Smaller text */}
          <ListChecks className="w-4 h-4 mr-2" />
          {quiz.questionList?.length || 0} questions
        </p>
        <div className="text-indigo-600 font-medium flex items-center dark:text-indigo-400 group-hover:underline text-sm"> {/* Smaller text */}
          Start Session <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  );

  // Handler to open the Create Quiz Modal
  const handleCreateQuiz = () => setShowCreateModal(true);

  // Handler to start a new quiz session
  const handleStartSession = async (quizId) => {
    try {
      const response = await apiCall('/sessions', { // Endpoint should match backend route
        method: 'POST',
        body: JSON.stringify({ quizId }) // Send quizId in the request body
      });
      // Navigate to the host page with the joinCode and quizId
      onNavigate('host', { joinCode: response.joinCode, quizId });
    } catch (err) {
      console.error('Failed to create session:', err);
      alert('Failed to create session. Please try again.'); // Basic error feedback
      // TODO: Implement better error handling (e.g., toast notification)
    }
  };

  // --- Delete Quiz Handlers ---
  const handleDeleteQuiz = async () => {
    if (!quizToDeleteId) return; // Guard clause
    setIsDeletingQuiz(true);
    try {
      // API call to delete the quiz
      await apiCall(`/quiz/${quizToDeleteId}/deleteQuiz`, { method: "DELETE" }); // Endpoint should match backend route
      // Update the local state to remove the deleted quiz
      setMyQuizzes(currentQuizzes => currentQuizzes.filter(q => q.id !== quizToDeleteId));
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      // Provide specific feedback for permission errors
      if (err.message && err.message.includes("403")) {
        alert("Permission Denied: You do not have permission to delete this quiz.");
      } else {
        alert("Error: Could not delete the quiz. Please try again.");
      }
      // TODO: Implement better error handling
    } finally {
      setIsDeletingQuiz(false); // Reset deleting state
      closeDeleteModal(); // Close the modal
    }
  };

  // Opens the delete confirmation modal
  const openDeleteModal = (id) => {
    setQuizToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Closes the delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setQuizToDeleteId(null);
  };

  // Handler to navigate to the analytics page for a specific attempt
  const handleViewAnalytics = (attempt) => {
    const isHost = attempt.hostUsername === user.username; // Determine if the current user hosted this session
    onNavigate('analytics', {
      sessionId: attempt.sessionId,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      isHost // Pass host status to analytics page
    });
  };

  // ## Component: AttemptedQuizCard ## (Represents a single past attempt)
  const AttemptedQuizCard = ({ attempt }) => (
    <div
      className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent mb-4 cursor-pointer hover:border-indigo-500 dark:bg-slate-800 dark:hover:border-indigo-500 transition-colors"
      onClick={() => handleViewAnalytics(attempt)}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{attempt.quizTitle}</h3>
      <p className="text-gray-600 mb-1 dark:text-slate-400 text-sm">Score: {attempt.score} / {attempt.totalQuestions}</p>
      <p className="text-gray-600 mb-1 dark:text-slate-400 text-sm">Attempted At: {new Date(attempt.attemptedAt).toLocaleString()}</p>
      <p className="text-gray-600 mb-1 dark:text-slate-400 text-sm">Session ID: {attempt.sessionId}</p>
    </div>
  );

  // Render the Dashboard UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b dark:bg-slate-800 dark:border-slate-700 sticky top-0 z-10"> {/* Made header sticky */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 hidden sm:block"> {/* Hide on small screens */}
                MentiMeter Clone {/* Updated App Name */}
              </h1>
            </div>
            {/* Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700 dark:text-slate-300">Welcome, {user?.username}</span>
              <button
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-500 dark:hover:bg-red-900/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-slate-300"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu (Dropdown) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b p-4 dark:bg-slate-800 dark:border-slate-700 shadow-lg">
          <div className="space-y-2">
            <div className="text-gray-700 py-2 dark:text-slate-300 font-semibold">Welcome, {user?.username}</div>
            <button
              onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} // Close menu on click
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </button>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }} // Close menu on click
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-500 dark:hover:bg-red-900/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Page Header & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Dashboard</h2>
            <p className="text-gray-600 mt-1 dark:text-slate-400">Create, host, and view your quiz history.</p> {/* Updated description */}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 w-full sm:w-auto flex-shrink-0"> {/* Added flex-shrink-0 */}
            <button
              onClick={handleCreateQuiz}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Create Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('join')}
              className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition dark:bg-slate-800 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-slate-700 shadow-sm hover:shadow-md"
            >
              Join Quiz
            </button>
          </div>
        </div>

        {/* ## "My Quizzes" Section ## */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">My Quizzes (Ready to Host)</h3>
          {loadingMyQuizzes ? (
            // Loading Skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : myQuizzes.length === 0 ? (
            // Empty State
            <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800 border dark:border-slate-700">
              <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" /> {/* Changed Icon */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">No quizzes created yet</h3>
              <p className="text-gray-600 mb-6 dark:text-slate-400">Click "Create Quiz" to make your first one!</p> {/* Updated text */}
            </div>
          ) : (
            // Quiz Card Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myQuizzes.map(quiz => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStartClick={() => handleStartSession(quiz.id)}
                  onDeleteClick={() => openDeleteModal(quiz.id)} // Pass handler to card
                />
              ))}
            </div>
          )}
        </div>

        {/* Tabs for History */}
        <div className="flex space-x-1 sm:space-x-4 border-b mb-8 dark:border-slate-700"> {/* Reduced space on small screens */}
          <button
            className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base transition-colors ${tab === 'hosted' ? 'border-b-4 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'text-gray-600 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            onClick={() => setTab('hosted')}
          >
            Hosted History
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base transition-colors ${tab === 'attempted' ? 'border-b-4 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'text-gray-600 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            onClick={() => setTab('attempted')}
          >
            Attempted Quizzes
          </button>
        </div>
      </div>

      {/* Main Content Area (Tab Content) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {tab === 'hosted' ? (
          // Display Hosted Quizzes History (using separate component)
          <HostedQuizzesPage user={user} onNavigate={onNavigate} />
        ) : (
          // Display Attempted Quizzes History
          <>
            {attemptedQuizzes.length === 0 ? (
              // Empty State for Attempted Quizzes
              <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800 border dark:border-slate-700">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">No attempted quizzes yet</h3>
                <p className="text-gray-600 mb-6 dark:text-slate-400">Join a quiz session to see your results here!</p> {/* Updated text */}
              </div>
            ) : (
              // Grid of Attempted Quiz Cards
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
          onSuccess={(newQuiz) => {
             // ## MODIFICATION: Add new quiz to the beginning of the list ##
            setMyQuizzes(currentQuizzes => [newQuiz, ...currentQuizzes]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteQuiz}
        isDeleting={isDeletingQuiz}
        title="Delete Quiz"
        message="Are you sure you want to permanently delete this quiz? All of its questions will be removed. This action cannot be undone."
      />

    </div>
  );
};

export default Dashboard;