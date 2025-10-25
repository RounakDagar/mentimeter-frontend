// src/pages/AsyncAttemptPage.js
import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';
import { Loader2, Send, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const AsyncAttemptPage = ({ shareCode, onNavigate }) => {
    
    const { user } = useAuth(); 
    const { apiCall } = useAPI();
    
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

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

    const handleSelectAnswer = (qIndex, oIndex) => {
        setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questionList.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
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
            onNavigate('asyncResult', { quizId: quiz.id, quizTitle: quiz.title });
        } catch (err) {
            if (err.message.includes("already attempted")) { // Check for specific backend error
                 setError("You have already submitted an attempt for this quiz.");
            } else {
                 setError('Failed to submit answers. Please try again.');
            }
            console.error("Failed to submit attempt:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>;
    }

    if (error) {
        return (
             <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4">
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                     <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">An Error Occurred</h2>
                     <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                     <button
                         onClick={() => onNavigate('dashboard')}
                         className="flex items-center justify-center w-full px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                     >
                         <ArrowLeft className="w-4 h-4 mr-1.5" />
                         Back to Dashboard
                     </button>
                 </div>
             </div>
        );
    }

    if (isFinished) {
         return (
             <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 dark:from-slate-900 dark:to-green-900">
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quiz Submitted!</h2>
                     <p className="text-slate-600 dark:text-slate-400 mb-6">Your answers have been recorded.</p>
                     <button
                         onClick={() => onNavigate('dashboard')}
                         className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                     >
                         Back to Dashboard
                     </button>
                 </div>
             </div>
         );
    }

    const currentQuestion = quiz.questionList[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questionList.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-2">{quiz.title}</h1>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Question {currentQuestionIndex + 1} of {quiz.questionList.length}
                </p>
                <div className="mb-8">
                    <p className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-5">
                        {currentQuestion.text}
                    </p>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(currentQuestionIndex, index)}
                                className={`w-full p-4 text-left rounded-lg font-medium transition ${
                                    answers[currentQuestionIndex] === index
                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 dark:ring-indigo-400'
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-8 pt-4 border-t dark:border-slate-700">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0 || submitting}
                        className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || answers[currentQuestionIndex] === undefined}
                            className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                            {submitting ? 'Submitting...' : 'Finish Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={submitting || answers[currentQuestionIndex] === undefined}
                            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsyncAttemptPage;