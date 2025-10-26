// src/pages/JoinSessionPage.js
import React, { useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext'; // Added useAuth back
import { Loader2, ArrowRight, AlertTriangle, ChevronLeft, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ##################################################################
// ## REUSABLE COMPONENTS (PREMIUM STYLING) ##
// ##################################################################

// --- Full Page Loader ---
const FullPageLoader = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4 font-sans">
        <div className="flex flex-col items-center text-gray-600 dark:text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg font-medium">Joining Session...</p>
        </div>
    </div>
);

// --- Full Page Error ---
// Modified to use the specific error messages from reference
const FullPageError = ({ error, onNavigate, onRetry }) => (
     <div className="min-h-screen w-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans">
         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-red-200 dark:border-red-700/50">
             <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Join Failed</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">{error}</p>
             <div className="flex flex-col sm:flex-row gap-3">
                 <button onClick={() => onNavigate('dashboard')} className="flex flex-1 items-center justify-center px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                     <ChevronLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
                 </button>
                 {/* Provide a retry button */}
                 <button onClick={onRetry} className="flex flex-1 items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                     Try Again
                 </button>
             </div>
         </div>
     </div>
);


// ##################################################################
// ## MAIN PAGE: JoinSessionPage (PREMIUM REDESIGN - Corrected Logic) ##
// ##################################################################
const JoinSessionPage = ({ onNavigate }) => {
    // --- Original State and Hooks (Preserved) ---
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Use auth context
    const { apiCall } = useAPI();

    // --- Original Submit Handler (Restored Precisely) ---
    const handleJoin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // **Original user check**
        if (!user || !user.username) {
            onNavigate('login');
            return;
        }

        // **Original length check**
        if (joinCode.length !== 6) {
            setError('Please enter a valid 6-character join code.');
            return;
        }

        setLoading(true);

        try {
            // **Original Step 1: Validate session**
            await apiCall(`/sessions/${joinCode}/validate`, { method: 'GET' });

            // **Original Step 2: Navigate on success**
            // Pass name: user.username as per original code
            onNavigate('participant', { joinCode, name: user.username });

        } catch (err) {
            // **Original Step 3: Handle validation failure**
            console.error("Failed to validate session:", err);
            // Use original error message
            setError('Session not found or is inactive. Please check the code.');
        } finally {
            // **Original finally block**
            setLoading(false);
        }
    };

    // --- Input handler (Original toUpperCase, limit length) ---
    const handleInputChange = (e) => {
        setError(''); // Clear error on input change
        // Use simpler toUpperCase from reference
        setJoinCode(e.target.value.toUpperCase().slice(0, 6));
    };


    // --- Loading State ---
    if (loading) {
        return <FullPageLoader />;
    }

    // --- Error State ---
    // Show error state *only if* an error exists and not loading
    // Use onRetry to simply clear the error and allow re-entry
    if (error && !loading) {
        return <FullPageError error={error} onNavigate={onNavigate} onRetry={() => setError('')} />;
    }


    // --- Main Render (Premium Re-styled) ---
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 dark:from-black dark:to-gray-900 p-4 font-sans">
            <div className="absolute top-5 left-5">
                 <button onClick={() => onNavigate('dashboard')} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors">
                     <ChevronLeft className="w-5 h-5 mr-1" /> Dashboard
                 </button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-800/50 text-center">
                    <LogIn className="w-12 h-12 text-indigo-500 mx-auto mb-5" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Join a Session</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Enter the 6-character code.</p>
                     {/* Display username clearly */}
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                         Joining as <span className="font-bold text-indigo-700 dark:text-indigo-400">{user?.username || '...'}</span>
                     </p>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label htmlFor="joinCode" className="sr-only">Join Code</label>
                            <input
                                type="text"
                                id="joinCode"
                                value={joinCode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 text-center text-4xl font-bold tracking-[0.5em] uppercase rounded-lg border-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 ease-in-out placeholder-gray-400 dark:placeholder-gray-600"
                                placeholder="- - - - - -"
                                maxLength="6"
                                required
                                autoFocus
                                autoComplete="off"
                                pattern="[A-Z0-9]{6}" // Helps mobile keyboards
                            />
                            {/* Display inline error from state */}
                            <AnimatePresence>
                                {error && (
                                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || joinCode.length !== 6} // Keep disabled logic
                            className="w-full flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? ( <Loader2 className="w-6 h-6 animate-spin" /> )
                            : ( <> Join Session <ArrowRight className="w-5 h-5 ml-2" /> </> )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default JoinSessionPage;