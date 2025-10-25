// src/pages/HostedQuizzesPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAPI } from '../hooks/useAPI';
import {
    Loader2,
    Trash2,
    AlertTriangle,
    Eye,
    Calendar,
    Clock,
    X,
    CheckCircle,
    AlertOctagon,
    History,
    Search, // Added
    ChevronDown, // Added
    FileSearch // Added
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ##################################################################
// ## REUSABLE COMPONENTS (Consistent with Premium Dashboard) ##
// ##################################################################

// --- Notification Pop-up ---
const Notification = ({ message, type = 'error', onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  const isError = type === 'error';
  return (
    <div className="fixed top-5 right-5 z-[200] w-full max-w-sm">
       <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`flex items-start p-4 rounded-xl shadow-2xl border ${ isError ? 'bg-red-50 dark:bg-gray-900 border-red-200 dark:border-red-700' : 'bg-green-50 dark:bg-gray-900 border-green-200 dark:border-green-700'} backdrop-blur-lg`}>
         <div className={`flex-shrink-0 p-1.5 rounded-full ${isError ? 'bg-red-100 dark:bg-red-800' : 'bg-green-100 dark:bg-green-800'}`}> {isError ? <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-300"/> : <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300"/>} </div>
         <div className="ml-3 flex-1"> <p className={`text-sm font-semibold ${isError ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'}`}>{isError ? 'Error' : 'Success'}</p> <p className={`text-sm ${isError ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'} mt-1`}>{message}</p> </div>
         <button onClick={onClose} className="ml-auto -mr-1 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
       </motion.div>
    </div>
  );
};


// --- Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
  return (
      <AnimatePresence>
          {isOpen && (
              <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex justify-center items-center p-4"
                  onClick={onClose} >
                  <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2, ease: "easeOut" }}
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center border border-gray-200 dark:border-gray-800"
                      onClick={e => e.stopPropagation()} >
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4"> <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" /> </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                      <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">{message}</p>
                      <div className="mt-6 flex justify-center gap-4">
                          <button type="button" className="px-5 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900" onClick={onClose} disabled={isDeleting} > Cancel </button>
                          <button type="button" className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" onClick={onConfirm} disabled={isDeleting} > {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isDeleting ? 'Deleting...' : 'Confirm'} </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
  );
};

// --- Skeleton Row for Table ---
const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div></td>
        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
            <div className="inline-block h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="inline-block h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </td>
    </tr>
);

// --- Empty State for Table ---
const EmptyState = () => (
  <div className="text-center p-12 bg-white dark:bg-gray-900/50 rounded-b-2xl">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <History className="w-8 h-8 text-gray-400 dark:text-gray-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">No Hosted Sessions Found</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Your past live quiz sessions will appear here once you host them.</p>
  </div>
);

// --- NEW: Empty State for No Search Results ---
const NoResultsState = ({ searchTerm, onClear }) => (
  <div className="text-center p-12 bg-white dark:bg-gray-900/50 rounded-b-2xl">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <FileSearch className="w-8 h-8 text-gray-400 dark:text-gray-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">No Results Found</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
      No sessions matched your search for: <span className="font-medium text-gray-800 dark:text-gray-200">"{searchTerm}"</span>
    </p>
    <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
    >
        Clear Search
    </button>
  </div>
);


// ##################################################################
// ## MAIN COMPONENT: HostedQuizzesPage
// ##################################################################

const HostedQuizzesPage = ({ user, onNavigate }) => {
    // --- State ---
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [sessionToDeleteCode, setSessionToDeleteCode] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingSession, setIsDeletingSession] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
    
    // --- NEW: State for Search & Sort ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'az', 'za'

    // --- Hooks ---
    const { apiCall } = useAPI();

    // --- Data Fetching (Original Logic Unchanged) ---
    const fetchHostedSessions = useCallback(async (username) => {
        if (!username) {
            console.warn("fetchHostedSessions called without username.");
            setSessions([]);
            if (initialLoadComplete) setLoading(false);
            return;
        }

        console.log(`fetchHostedSessions: Called for user: ${username}. Setting loading=true.`);
        setLoading(true);
        try {
            const endpoint = `/quiz/${username}/HostedQuiz`;
            const data = await apiCall(endpoint, { method: 'GET' });
            console.log("fetchHostedSessions: API Response Received:", data);
            
            // Set raw data (sorting will be handled by useMemo)
            setSessions(Array.isArray(data) ? data : []);
            console.log("fetchHostedSessions: Sessions state updated.");

        } catch (err) {
            console.error("fetchHostedSessions: Error fetching hosted sessions:", err);
            setSessions([]);
            setNotification({ show: true, message: 'Failed to fetch hosted sessions.', type: 'error' });
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
            console.log("fetchHostedSessions: Fetch attempt finished. Setting loading=false.");
        }
    }, [apiCall, initialLoadComplete]);

    // --- Effect to Fetch Data (Original Logic Unchanged) ---
    useEffect(() => {
        const currentUsername = user?.username;
        console.log(`useEffect[user?.username]: Current username: ${currentUsername}`);

        if (currentUsername) {
            fetchHostedSessions(currentUsername);
        } else if (initialLoadComplete) {
            console.log("useEffect[user?.username]: Username gone after initial load, clearing sessions.");
            setSessions([]);
            setLoading(false);
        }
    }, [user?.username, fetchHostedSessions, initialLoadComplete]);

    // --- NEW: Client-side Filter & Sort ---
    const processedSessions = useMemo(() => {
        let filtered = sessions;

        // 1. Filter by Search Term
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = sessions.filter(session => 
                session.quizTitle.toLowerCase().includes(lowerSearchTerm) ||
                session.joinCode.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // 2. Sort the filtered results
        const sorted = [...filtered]; // Create a new array to sort
        if (sortOrder === 'recent') {
            sorted.sort((a, b) => new Date(b.hostedAt) - new Date(a.hostedAt));
        } else if (sortOrder === 'az') {
            sorted.sort((a, b) => (a.quizTitle || '').localeCompare(b.quizTitle || ''));
        } else if (sortOrder === 'za') {
            sorted.sort((a, b) => (b.quizTitle || '').localeCompare(a.quizTitle || ''));
        }

        return sorted;
    }, [sessions, searchTerm, sortOrder]);


    // --- Handlers (Original Logic Unchanged) ---
    const openDeleteModal = (code) => { setSessionToDeleteCode(code); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSessionToDeleteCode(null); };

    const handleDeleteSession = async () => {
        if (!sessionToDeleteCode || !user?.username) return;
        setIsDeletingSession(true);
        try {
            await apiCall(`/sessions/${sessionToDeleteCode}`, { method: 'DELETE' });
            await fetchHostedSessions(user.username); // Re-fetch
        } catch (err) {
            console.error("Failed to delete session:", err);
            setNotification({ show: true, message: 'Failed to delete session record.', type: 'error' });
        } finally {
            setIsDeletingSession(false);
            closeDeleteModal();
        }
    };

    const viewAnalytics = (session) => {
        onNavigate('analytics', { sessionId: session.joinCode, quizTitle: session.quizTitle, isHost: true, totalQuestions: session.totalQuestions });
    };

    // --- Render Logic ---
    return (
        <div className="font-sans">
            {/* --- NEW: Control Bar for Search & Sort --- */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by title or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                </div>
                {/* Sort Dropdown */}
                <div className="relative flex-shrink-0">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                        <option value="recent">Sort: Most Recent</option>
                        <option value="az">Sort: Title (A-Z)</option>
                        <option value="za">Sort: Title (Z-A)</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </span>
                </div>
            </div>

            {/* --- Main Table Card --- */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quiz Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Code</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hosted On</th>
                                {/* Participants TH Removed */}
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         
                         {/* Show Skeleton ONLY when loading */}
                         {loading && (
                             <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                            </tbody>
                         )}

                         {/* Show Data ONLY when NOT loading and processed sessions exist */}
                         {!loading && processedSessions.length > 0 && (
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {/* Use processedSessions here */}
                                {processedSessions.map((session) => (
                                    <tr key={session.joinCode} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-xs">{session.quizTitle || 'Untitled Quiz'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700">{session.joinCode}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center" title={session.hostedAt ? new Date(session.hostedAt).toLocaleString() : 'Date N/A'}>
                                                <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                                {session.hostedAt ? new Date(session.hostedAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                             <div className="flex items-center mt-1 text-xs" title={session.hostedAt ? new Date(session.hostedAt).toLocaleString() : 'Time N/A'}>
                                                 <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                                 {session.hostedAt ? new Date(session.hostedAt).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}) : 'N/A'}
                                             </div>
                                        </td>
                                        {/* Participants TD Removed */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                            <button onClick={() => viewAnalytics(session)} className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" title="View Analytics"> <Eye className="w-5 h-5" /> </button>
                                            <button onClick={() => openDeleteModal(session.joinCode)} className="p-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="Delete Session Record" disabled={isDeletingSession}> <Trash2 className="w-5 h-5" /> </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* --- UPDATED Empty State Logic --- */}
                
                {/* 1. Show "No Sessions" if not loading, and the base sessions array is empty */}
                {!loading && sessions.length === 0 && (
                    <EmptyState />
                )}

                {/* 2. Show "No Results" if not loading, base sessions exist, but filtered results are empty */}
                {!loading && sessions.length > 0 && processedSessions.length === 0 && (
                    <NoResultsState searchTerm={searchTerm} onClear={() => setSearchTerm('')} />
                )}
            </div>

            {/* --- Modals & Notifications (Unchanged) --- */}
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteSession} isDeleting={isDeletingSession} title="Delete Hosted Session Record" message={`Are you sure you want to delete the record for session ${sessionToDeleteCode}? This action cannot be undone.`} />
            <AnimatePresence> {notification.show && ( <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ show: false, message: '', type: 'error' })} /> )} </AnimatePresence>
        </div>
    );
};

export default HostedQuizzesPage;