// src/pages/AsyncAttemptPage.js
import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';

import { 
    Loader2, 
    Send, 
    CheckCircle, 
    AlertTriangle, 
    ArrowLeft,
    ChevronLeft, // New
    ChevronRight,
    XCircle // New
} from 'lucide-react';

// --- Re-styled Full-Page States ---

// --- Loading State ---
const LoadingState = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
        <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg font-medium">Loading Quiz...</p>
        </div>
    </div>
);

// --- Error State ---
const ErrorState = ({ error, onNavigate }) => (
     <div className="min-h-screen w-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans">
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-red-200 dark:border-red-700/50">
             <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">An Error Occurred</h2>
             <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">{error}</p>
             <button
                 onClick={() => onNavigate('dashboard')}
                 className="flex items-center justify-center w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
             >
                 <ArrowLeft className="w-4 h-4 mr-1.5" />
                 Back to Dashboard
             </button>
         </div>
     </div>
);

// --- Finished State ---
// This state is not reachable with the current logic, but is re-styled per your file's code.
const FinishedState = ({ onNavigate }) => (
     <div className="min-h-screen w-full flex items-center justify-center bg-green-50 dark:bg-green-900/10 p-4 font-sans">
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-green-200 dark:border-green-700/50">
             <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quiz Submitted!</h2>
             <p className="text-slate-600 dark:text-slate-400 mb-8">Your answers have been recorded.</p>
             <button
                 onClick={() => onNavigate('dashboard')}
                 className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
             >
                 Back to Dashboard
             </button>
         </div>
     </div>
);


// --- Main Component ---
const AsyncAttemptPage = ({ shareCode, onNavigate }) => {
    
    // --- Original State and Hooks (Preserved) ---
    
    const { apiCall } = useAPI();
    
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // --- Original Effect (Preserved) ---
    useEffect(() => {
        const loadQuiz = async () => {
            setLoading(true);
            setError('');
            try {
                const quizData = await apiCall(`/share/${shareCode}/quiz`);
                setQuiz(quizData);
            } catch (err) {
                if (err.message.includes("401") || err.message.includes("403")) {
                    setError("You must be logged in to attempt this quiz.");
                } else {
                    setError('Invalid or expired share link.');
                }
                console.error("Failed to load shared quiz:", err);
            } finally {
                setLoading(false);
            }
        };
        if (shareCode) {
            loadQuiz();
        } else {
            setError('No share code provided.');
            setLoading(false);
            onNavigate('dashboard');
        }
    }, [shareCode, apiCall, onNavigate]);

    // --- Original Handlers (Preserved) ---
    const handleSelectAnswer = (qIndex, oIndex) => {
        if (submitting) return; // Prevent changing answers while submitting
        setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questionList.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            await apiCall(`/share/${shareCode}/attempt`, {
                method: 'POST',
                body: JSON.stringify(answers),
            });
            // This navigation happens on success
            onNavigate('asyncResult', { quizId: quiz.id, quizTitle: quiz.title });
        } catch (err) {
            if (err.message.includes("already attempted")) {
                 setError("You have already submitted an attempt for this quiz.");
            } else {
                 setError('Failed to submit answers. Please try again.');
            }
            console.error("Failed to submit attempt:", err);
            setSubmitting(false); // Only set submitting to false on error
        }
        // Don't set submitting(false) here, as we are navigating away
    };

    // --- Original Render Logic (Preserved) ---
    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} onNavigate={onNavigate} />;
    }

    if (isFinished) {
         return <FinishedState onNavigate={onNavigate} />;
    }
    
    // --- Data for Re-styled Render ---
    const currentQuestion = quiz.questionList[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questionList.length - 1;
    const progressPercent = ((currentQuestionIndex + 1) / quiz.questionList.length) * 100;
    const isAnswerSelected = answers[currentQuestionIndex] !== undefined;

    // --- New Re-styled JSX ---
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-200">
            
            {/* --- Back Button --- */}
            <div className="w-full max-w-2xl mb-4">
                <button
                    onClick={() => onNavigate('dashboard')}
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Exit Quiz
                </button>
            </div>

            {/* --- Main Quiz Card --- */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                
                {/* --- Progress Bar --- */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="p-6 md:p-8">
                    {/* --- Header --- */}
                    <div className="text-center mb-6">
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">
                            Question {currentQuestionIndex + 1} of {quiz.questionList.length}
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 break-words">
                            {quiz.title}
                        </h1>
                    </div>

                    {/* --- Question --- */}
                    <div className="mb-8">
                        <p className="text-xl font-semibold text-center text-slate-800 dark:text-slate-100 mb-6 min-h-[3em]">
                            {currentQuestion.text}
                        </p>
                        
                        {/* --- Options --- */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = answers[currentQuestionIndex] === index;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAnswer(currentQuestionIndex, index)}
                                        disabled={submitting}
                                        className={`w-full p-4 text-left rounded-lg font-medium transition-all duration-150 ease-in-out flex items-center justify-between group disabled:opacity-70 ${
                                            isSelected
                                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg'
                                            : 'bg-white text-slate-800 border border-slate-300 hover:bg-indigo-50 hover:border-indigo-400 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:border-indigo-500'
                                        }`}
                                    >
                                        <span className="break-words pr-4">{option}</span>
                                        {isSelected && (
                                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        )}
                                        {!isSelected && (
                                            <span className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-slate-400 dark:border-slate-500 group-hover:border-indigo-500 transition-colors" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Navigation --- */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0 || submitting}
                            className="flex items-center px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </button>

                        {isLastQuestion ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !isAnswerSelected}
                                className="flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                                {submitting ? 'Submitting...' : 'Finish Quiz'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={submitting || !isAnswerSelected}
                                className="flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsyncAttemptPage;