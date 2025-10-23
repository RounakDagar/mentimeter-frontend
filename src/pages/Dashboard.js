/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ListChecks,
  Trash2,
  Loader2,
  AlertTriangle,
  Pencil,
  Search,
  Clock, // For Attempted
  Hash, // For Hosted
  Calendar, // For Hosted
  Home, // For Sidebar
  CheckCheck, // For Sidebar
  History // For Sidebar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import { useTheme } from '../context/ThemeContext';
import CreateQuizModal from './CreateQuizModal';
// We will define the HostedQuizCard locally to ensure it's refactored
// import HostedQuizzesPage from './HostedQuizzesPage'; // No longer needed if we define the card here

// ######################################################################
// ## Modern Sub-Components
// ######################################################################

/**
 * Navigation Button for the Sidebar
 */
const NavButton = ({ icon: Icon, label, isActive, ...props }) => (
  <button
    {...props}
    className={`
      flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all duration-200
      ${isActive
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
      }
    `}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

/**
 * Sidebar Component
 */
const Sidebar = ({ tab, setTab, onNavigate, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (newTab) => {
    setTab(newTab);
    setMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Logo/Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            MentiMeter
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2">
        <NavButton
          icon={Home}
          label="My Quizzes"
          isActive={tab === 'myQuizzes'}
          onClick={() => handleNavClick('myQuizzes')}
        />
        <NavButton
          icon={History}
          label="Hosted History"
          isActive={tab === 'hosted'}
          onClick={() => handleNavClick('hosted')}
        />
        <NavButton
          icon={CheckCheck}
          label="Attempted Quizzes"
          isActive={tab === 'attempted'}
          onClick={() => handleNavClick('attempted')}
        />
      </nav>

      {/* Footer/User Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg mb-3">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
            {user?.username}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            IT Student
          </span>
        </div>
        
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-all duration-200"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="font-semibold text-sm">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-64 z-30">
        <SidebarContent />
      </div>
    </>
  );
};

/**
 * Mobile Header
 */
const MobileHeader = ({ title, onMenuClick }) => (
  <header className="md:hidden sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
    <button
      onClick={onMenuClick}
      className="p-2 text-slate-700 dark:text-slate-300"
      aria-label="Open menu"
    >
      <Menu className="w-6 h-6" />
    </button>
    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
      {title}
    </h2>
    <div className="w-8"></div> {/* Spacer */}
  </header>
);

/**
 * Refactored SkeletonCard
 */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 bg-slate-200 rounded-lg dark:bg-slate-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-3/4 dark:bg-slate-700"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 dark:bg-slate-700"></div>
        </div>
      </div>
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-6 dark:bg-slate-700"></div>
      <div className="h-10 bg-slate-200 rounded-lg w-full dark:bg-slate-700"></div>
    </div>
  </div>
);

/**
 * Refactored EmptyState
 */
const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-sm border dark:bg-slate-800 dark:border-slate-700 col-span-1 md:col-span-2 lg:col-span-3">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 text-indigo-400 dark:text-indigo-600 mx-auto mb-6 rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2 dark:text-slate-100">
            {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {message}
        </p>
    </div>
);

/**
 * Refactored ConfirmationModal (Same logic, slightly better styling)
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 transition-opacity duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center transform transition-all duration-200 scale-95 opacity-0 animate-scale-in">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">{message}</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors min-w-[140px]"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
              ) : (
                  'Confirm Delete'
              )}
            </button>
          </div>
        </div>
         <style>{`
           @keyframes scaleIn {
             from { opacity: 0; transform: scale(0.95); }
             to { opacity: 1; transform: scale(1); }
           }
           .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
         `}</style>
      </div>
    );
};

// ######################################################################
// ## Refactored Card Components
// ######################################################################

/**
 * Refactored QuizCard (for My Quizzes tab)
 */
const QuizCard = ({ quiz, onStartClick, onDeleteClick, onEditClick }) => (
  <div className="relative group bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    {/* Action Buttons */}
    <div className="absolute top-4 right-4 flex space-x-2 z-10">
      <button
        onClick={(e) => { e.stopPropagation(); onEditClick(); }}
        className="p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400"
        aria-label="Edit quiz"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
        className="p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all duration-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"
        aria-label="Delete quiz"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    {/* Card Content */}
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
          <ListChecks className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2 dark:text-slate-100 pr-16">{quiz.title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {quiz.questionList?.length || 0} questions
        </p>
      </div>
      
      {/* Action Button */}
      <button
        onClick={onStartClick}
        className="mt-6 w-full flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 dark:shadow-none text-sm"
      >
        <span>Start Session</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/**
 * Refactored AttemptedQuizCard
 */
const AttemptedQuizCard = ({ attempt, onClick }) => (
  <div
    className="relative group bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex-grow">
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Your Score</p>
      <div className="mb-3">
        <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{attempt.score}</span>
        <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500"> / {attempt.totalQuestions}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2 dark:text-slate-100">{attempt.quizTitle}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
        <Clock className="w-4 h-4 mr-1.5" /> {new Date(attempt.attemptedAt).toLocaleString()}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Session ID: {attempt.sessionId}</p>
    </div>
    <div className="text-indigo-600 font-medium flex items-center dark:text-indigo-400 text-sm w-fit mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      View Results <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
    </div>
    {/* Always visible arrow for affordance */}
    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 absolute top-6 right-6 group-hover:opacity-0 transition-opacity duration-300" />
  </div>
);

/**
 * Refactored HostedQuizCard (Replaces the one from HostedQuizzesPage)
 */
const HostedQuizCard = ({ quiz, onViewDetailsClick, onDeleteClick }) => (
  <div className="relative group bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    {/* Delete Button */}
    <button
      onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
      className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all duration-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/50 dark:hover:text-red-400 z-10"
      aria-label="Delete session history"
    >
      <Trash2 className="w-4 h-4" />
    </button>
    
    {/* Clickable Area */}
    <div onClick={onViewDetailsClick} className="cursor-pointer">
      <div className="mb-4">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Join Code</p>
        <p className="font-mono font-bold text-3xl text-slate-800 dark:text-slate-200 tracking-wider bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-lg inline-block">
          {quiz.joinCode}
        </p>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-3 dark:text-slate-100 pr-10">{quiz.quizTitle}</h3>
      
      <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 mb-5">
        <p className="flex items-center"><ListChecks className="w-4 h-4 mr-2 flex-shrink-0" /> {quiz.totalQuestions} Questions</p>
        <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 flex-shrink-0" /> {quiz.hostedAt ? new Date(quiz.hostedAt).toLocaleString() : "N/A"}</p>
      </div>

      <div className="text-indigo-600 font-medium flex items-center dark:text-indigo-400 text-sm w-fit mt-auto pt-2 group-hover:underline">
        View Analytics <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  </div>
);

// Wrapper component to pass props to the locally defined HostedQuizCard
const HostedQuizCardWrapper = ({ quiz, onViewAnalytics, onDelete }) => (
  <HostedQuizCard
    quiz={quiz}
    onViewDetailsClick={() => onViewAnalytics(quiz)}
    onDeleteClick={() => onDelete(quiz.joinCode)}
  />
);


// ######################################################################
// ## Main Dashboard Component
// ######################################################################
const Dashboard = ({ onNavigate }) => {
  // --- State ---
  const [tab, setTab] = useState('myQuizzes'); // 'myQuizzes', 'hosted', 'attempted'
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [hostedHistory, setHostedHistory] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [loadingStates, setLoadingStates] = useState({ myQuizzes: true, hosted: true, attempted: true });
  const [errors, setErrors] = useState({ myQuizzes: null, hosted: null, attempted: null });

  // Search & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'alphabetical'

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizToDeleteId, setQuizToDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [sessionToDeleteCode, setSessionToDeleteCode] = useState(null);
  const [isSessionDeleteModalOpen, setIsSessionDeleteModalOpen] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  // --- Hooks ---
  const { user, logout } = useAuth(); // AuthContext now handled in Sidebar
  const { apiCall } = useAPI();
  
  // --- Data Fetching ---
  const fetchData = useCallback(async (dataType) => {
    if (!user?.username) {
      setLoadingStates(prev => ({ ...prev, [dataType]: false }));
      return;
    }
    setLoadingStates(prev => ({ ...prev, [dataType]: true }));
    setErrors(prev => ({ ...prev, [dataType]: null }));

    let url, setData, errorMsg;

    switch (dataType) {
      case 'myQuizzes':
        url = `/quiz/user/${user.username}`;
        setData = setMyQuizzes;
        errorMsg = "Failed to fetch your quizzes";
        break;
      case 'hosted':
        url = `/quiz/${user.username}/HostedQuiz`;
        setData = setHostedHistory;
        errorMsg = "Failed to fetch hosted quiz history";
        break;
      case 'attempted':
        url = `/quiz/${user.username}/AttemptedQuiz`;
        setData = setAttemptedQuizzes;
        errorMsg = "Failed to fetch attempted quizzes";
        break;
      default:
        setLoadingStates(prev => ({ ...prev, [dataType]: false }));
        return;
    }

    try {
      const data = await apiCall(url, { method: 'GET' });
      // My Quizzes are reversed by default to show newest first.
      setData(Array.isArray(data) ? (dataType === 'myQuizzes' ? data.slice().reverse() : data) : []);
    } catch (err) {
      console.error(`${errorMsg}:`, err);
      setData([]);
      setErrors(prev => ({ ...prev, [dataType]: err.message || errorMsg }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [dataType]: false }));
    }
  }, [user, apiCall]);

  useEffect(() => {
    fetchData('myQuizzes');
    fetchData('hosted');
    fetchData('attempted');
  }, [fetchData]);


  // --- Sorting & Filtering Logic (Optimized with useMemo) ---

  const getSortableTitle = (item) => item.title || item.quizTitle || '';
  const getSortableDate = (item, type) => {
      if (type === 'myQuizzes') return new Date(item.createdAt || 0); // Assuming 'createdAt' exists for quizzes
      if (type === 'hosted') return new Date(item.hostedAt || 0);
      if (type === 'attempted') return new Date(item.attemptedAt || 0);
      return 0;
  };
  
  // 1. Sort Data
  const sortedMyQuizzes = useMemo(() => {
    const sorted = [...myQuizzes];
    if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => getSortableTitle(a).localeCompare(getSortableTitle(b)));
    }
    // 'newest' is the default fetched order (already reversed)
    return sorted;
  }, [myQuizzes, sortBy]);

  const sortedHostedHistory = useMemo(() => {
    const sorted = [...hostedHistory];
    if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => getSortableTitle(a).localeCompare(getSortableTitle(b)));
    } else { // 'newest'
      sorted.sort((a, b) => getSortableDate(b, 'hosted') - getSortableDate(a, 'hosted'));
    }
    return sorted;
  }, [hostedHistory, sortBy]);

  const sortedAttemptedQuizzes = useMemo(() => {
    const sorted = [...attemptedQuizzes];
    if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => getSortableTitle(a).localeCompare(getSortableTitle(b)));
    } else { // 'newest'
      sorted.sort((a, b) => getSortableDate(b, 'attempted') - getSortableDate(a, 'attempted'));
    }
    return sorted;
  }, [attemptedQuizzes, sortBy]);

  // 2. Filter Data
  const filterItems = (items, term) => {
    if (!term) return items;
    const lowerCaseTerm = term.toLowerCase();
    return items.filter(item => {
      const title = getSortableTitle(item);
      const joinCode = item.joinCode || '';
      const sessionId = item.sessionId || '';
      return title.toLowerCase().includes(lowerCaseTerm) ||
             joinCode.toLowerCase().includes(lowerCaseTerm) ||
             sessionId.toLowerCase().includes(lowerCaseTerm);
    });
  };

  const filteredMyQuizzes = useMemo(() => filterItems(sortedMyQuizzes, searchTerm), [sortedMyQuizzes, searchTerm]);
  const filteredHostedHistory = useMemo(() => filterItems(sortedHostedHistory, searchTerm), [sortedHostedHistory, searchTerm]);
  const filteredAttemptedQuizzes = useMemo(() => filterItems(sortedAttemptedQuizzes, searchTerm), [sortedAttemptedQuizzes, searchTerm]);


  // --- Event Handlers ---
  const handleCreateQuiz = () => setShowCreateModal(true);

  const handleStartSession = async (quizId) => {
     try {
       const response = await apiCall('/sessions', {
         method: 'POST',
         body: JSON.stringify({ quizId })
       });
       onNavigate('host', { joinCode: response.joinCode, quizId });
     } catch (err) {
       console.error('Failed to create session:', err);
       alert('Failed to create session. Please try again.');
     }
  };

  const handleEditQuiz = (quizId) => {
    onNavigate('edit-quiz', { quizId });
  };

  // Quiz Deletion
  const handleDeleteQuiz = async () => {
     if (!quizToDeleteId) return;
     setIsDeletingQuiz(true);
     try {
       await apiCall(`/quiz/${quizToDeleteId}/deleteQuiz`, { method: "DELETE" });
       setMyQuizzes(currentQuizzes => currentQuizzes.filter(q => q.id !== quizToDeleteId));
     } catch (err) {
       console.error("Failed to delete quiz:", err);
       alert(err.message.includes("403") ? "Permission Denied: Cannot delete this quiz." : "Error: Could not delete quiz.");
     } finally {
       setIsDeletingQuiz(false);
       closeDeleteModal();
     }
  };
  const openDeleteModal = (id) => { setQuizToDeleteId(id); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setQuizToDeleteId(null); };

   // Session History Deletion
   const handleDeleteSession = async () => {
       if (!sessionToDeleteCode) return;
       setIsDeletingSession(true);
       try {
           await apiCall(`/sessions/${sessionToDeleteCode}/deleteSession`, { method: "DELETE" });
           setHostedHistory(current => current.filter(quiz => quiz.joinCode !== sessionToDeleteCode));
       } catch (err) {
           console.error("Failed to delete session:", err);
           alert(err.message.includes("403") ? "Permission Denied: Cannot delete this session." : "Error: Could not delete session.");
       } finally {
           setIsDeletingSession(false);
           closeSessionDeleteModal();
       }
   };
   const openSessionDeleteModal = (joinCode) => { setSessionToDeleteCode(joinCode); setIsSessionDeleteModalOpen(true); };
   const closeSessionDeleteModal = () => { setIsSessionDeleteModalOpen(false); setSessionToDeleteCode(null); };

  // Navigation Handlers
  const handleViewAnalytics = (attempt) => {
    onNavigate('analytics', {
      sessionId: attempt.sessionId,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      isHost: false
    });
  };

  const handleViewHostedAnalytics = (hostedQuiz) => {
     onNavigate('hostedQuizAnalytics', {
       quizId: hostedQuiz.quizId,
       quizTitle: hostedQuiz.quizTitle,
       joinCode: hostedQuiz.joinCode,
       username: user.username,
     });
  };

  // --- Render UI ---
  const renderTabContent = () => {
    let loading, error, data, emptyIcon, emptyTitle, emptyMessage;
    
    switch (tab) {
      case 'hosted':
        loading = loadingStates.hosted;
        error = errors.hosted;
        data = filteredHostedHistory;
        emptyIcon = History;
        emptyTitle = searchTerm ? "No Hosted Sessions Found" : "No Hosted Quizzes Yet";
        emptyMessage = searchTerm ? `Your search for "${searchTerm}" did not match any hosted sessions.` : 'Host a quiz from "My Quizzes" to see its history here!';
        return (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)} </div>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-8">Error loading hosted history: {error}</p>
          ) : data.length === 0 ? (
            <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map(quiz => (
                <HostedQuizCardWrapper
                  key={quiz.id || quiz.joinCode}
                  quiz={quiz}
                  onViewAnalytics={handleViewHostedAnalytics}
                  onDelete={openSessionDeleteModal}
                />
              ))}
            </div>
          )
        );

      case 'attempted':
        loading = loadingStates.attempted;
        error = errors.attempted;
        data = filteredAttemptedQuizzes;
        emptyIcon = CheckCheck;
        emptyTitle = searchTerm ? "No Attempts Found" : "No Attempted Quizzes Yet";
        emptyMessage = searchTerm ? `Your search for "${searchTerm}" did not match any attempts.` : 'Join a quiz session to see your results here!';
        return (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)} </div>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-8">Error loading attempted quizzes: {error}</p>
          ) : data.length === 0 ? (
            <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map(attempt => (
                <AttemptedQuizCard
                  key={attempt.id}
                  attempt={attempt}
                  onClick={() => handleViewAnalytics(attempt)}
                />
              ))}
            </div>
          )
        );

      case 'myQuizzes':
      default:
        loading = loadingStates.myQuizzes;
        error = errors.myQuizzes;
        data = filteredMyQuizzes;
        emptyIcon = Home;
        emptyTitle = searchTerm ? "No Quizzes Found" : "No Quizzes Created Yet";
        emptyMessage = searchTerm ? `Your search for "${searchTerm}" did not match any quizzes.` : 'Click "Create Quiz" to make your first one!';
        return (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)} </div>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-8">Error loading quizzes: {error}</p>
          ) : data.length === 0 ? (
            <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map(quiz => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStartClick={() => handleStartSession(quiz.id)}
                  onDeleteClick={() => openDeleteModal(quiz.id)}
                  onEditClick={() => handleEditQuiz(quiz.id)}
                />
              ))}
            </div>
          )
        );
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      
      {/* --- Sidebar --- */}
      <Sidebar
        tab={tab}
        setTab={setTab}
        onNavigate={onNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* --- Mobile Header --- */}
      <MobileHeader
        title={
          tab === 'myQuizzes' ? 'My Quizzes' :
          tab === 'hosted' ? 'Hosted History' : 'Attempted Quizzes'
        }
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* --- Main Content Area (with sidebar padding on desktop) --- */}
      <div className="md:pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* --- Top Actions & Title --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h2>
              <p className="text-gray-600 mt-1 dark:text-slate-400">Manage your quizzes and view history.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={handleCreateQuiz}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 dark:shadow-none text-sm"
              >
                <Plus className="w-4 h-4" /> <span>Create Quiz</span>
              </button>
              <button
                onClick={() => onNavigate('join')}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 text-sm shadow-sm"
              >
                Join Quiz
              </button>
            </div>
          </div>

          {/* --- Search & Filter Bar --- */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by title, code, or session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            {/* Sort Dropdown */}
            <div className="flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto h-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 shadow-sm appearance-none pr-8"
                aria-label="Sort by"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="alphabetical">Sort by: Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>


          {/* --- Tab Content --- */}
          {/* The content is rendered based on the 'tab' state */}
          <section className="pb-8">
            {renderTabContent()}
          </section>

        </main>
      </div> {/* End main content area */}

      {/* --- Modals --- */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newQuiz) => {
            setMyQuizzes(currentQuizzes => [newQuiz, ...currentQuizzes]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Quiz Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteQuiz}
        isDeleting={isDeletingQuiz}
        title="Delete Quiz"
        message="Are you sure you want to permanently delete this quiz? All of its questions will be removed. This action cannot be undone."
      />

       {/* Session History Delete Confirmation */}
       <ConfirmationModal
           isOpen={isSessionDeleteModalOpen}
           onClose={closeSessionDeleteModal}
           onConfirm={handleDeleteSession}
           isDeleting={isDeletingSession}
           title="Delete Session History"
           message={`Are you sure you want to delete the history for session "${sessionToDeleteCode}"? Analytics data will be removed. This action cannot be undone.`}
       />

    </div> // End min-h-screen container
  );
};
export default Dashboard;