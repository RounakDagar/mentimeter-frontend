// src/pages/EditQuizPage.js
import React, { useState, useEffect } from 'react';
import { 
    X, 
    Plus, 
    Loader2, 
    Trash2,
    ChevronLeft,
    Save,
    AlertTriangle,
    AlertOctagon,
    GripVertical, // New: For "drag" handle
    CheckCircle, 
    Check
} from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';

// ##################################################################
// ## RE-STYLED REUSABLE COMPONENTS ##
// ##################################################################

// --- Notification Pop-up (Replaces alert()) ---
const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-[200] w-full max-w-sm">
      <div 
        className="flex items-start p-4 rounded-xl shadow-2xl border bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-700/50 backdrop-blur-lg animate-slide-in"
      >
        <div className="flex-shrink-0 p-1.5 rounded-full bg-red-100 dark:bg-red-800">
          <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-300" /> 
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-red-900 dark:text-red-200">
            Error
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {message}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-2 p-1.5 rounded-full text-red-900/70 hover:bg-red-100 dark:text-red-300/70 dark:hover:bg-red-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// --- Full Page Loader ---
const FullPageLoader = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4 font-sans">
        <div className="flex flex-col items-center text-gray-600 dark:text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg font-medium">Loading Quiz Editor...</p>
        </div>
    </div>
);

// --- Full Page Error ---
const FullPageError = ({ error, onNavigate }) => (
     <div className="min-h-screen w-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans">
         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-red-200 dark:border-red-700/50">
             <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">An Error Occurred</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">{error}</p>
             <button
                 onClick={() => onNavigate('dashboard')} // Use navigate from props
                 className="flex items-center justify-center w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
             >
                 <ChevronLeft className="w-4 h-4 mr-1.5" />
                 Back to Dashboard
             </button>
         </div>
     </div>
);


// ##################################################################
// ## "WAY MORE" RE-STYLED SUB-COMPONENT: QuestionEditor ##
// ##################################################################

const QuestionEditor = ({
  question,
  qIndex,
  onRemoveQuestion,
  onUpdateQuestion,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  isLastQuestion,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
      {/* --- Card Header --- */}
      <div className="flex items-center justify-between p-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center space-x-2">
            <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-600 cursor-not-allowed" title="Reordering coming soon!" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Question {qIndex + 1}
            </h3>
        </div>
        <button
          type="button"
          onClick={() => onRemoveQuestion(qIndex)}
          disabled={isLastQuestion}
          className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-500 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:opacity-50 transition-colors"
          title={isLastQuestion ? "Cannot remove the only question" : "Remove question"}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* --- Card Body --- */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* --- Question Text (Textarea) --- */}
        <div>
            <label htmlFor={`q-text-${qIndex}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Text</label>
            <textarea
                id={`q-text-${qIndex}`}
                value={question.text}
                onChange={(e) => onUpdateQuestion(qIndex, 'text', e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 dark:focus:border-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-gray-100 dark:placeholder-gray-500 transition"
                placeholder="e.g., What is the capital of France?"
                rows="3"
                required
            />
        </div>

        {/* --- Options --- */}
        <div>
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options
                </h4>
                {question.correctAnswerIndex !== null && (
                <button
                    type="button"
                    onClick={() => onUpdateQuestion(qIndex, 'correctAnswerIndex', null)}
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                    Clear correct answer
                </button>
                )}
            </div>

            {/* --- Dynamic Options List (Radical Redesign) --- */}
            <div className="space-y-3">
                {question.options.map((opt, oIndex) => {
                    const isSelected = question.correctAnswerIndex === oIndex;
                    return (
                        // This label makes the whole row clickable to check the radio
                        <label 
                            key={oIndex} 
                            className={`flex items-center space-x-3 group p-1 pr-3 rounded-lg transition-all ${
                                isSelected 
                                ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                                : 'ring-2 ring-transparent'
                            }`}
                        >
                            {/* --- THIS IS YOUR ORIGINAL <input> LOGIC --- */}
                            {/* It's visually hidden but 100% functional */}
                            <input
                                type="radio"
                                name={`correct-answer-${qIndex}`}
                                checked={isSelected}
                                onChange={() => onUpdateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                                className="sr-only" // Visually hide the default radio
                            />

                            {/* --- Custom Radio UI --- */}
                            <div 
                                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md cursor-pointer ${
                                    isSelected 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-300'
                                } transition-colors`}
                            >
                                {isSelected && <Check className="w-5 h-5" />}
                            </div>
                            
                            {/* --- Option Text Input --- */}
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => onUpdateOption(qIndex, oIndex, e.target.value)}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 dark:focus:border-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-gray-100 dark:placeholder-gray-500 transition"
                                placeholder={`Option ${oIndex + 1}`}
                                required
                            />
                            
                            {/* --- Remove Option Button --- */}
                            <button
                                type="button"
                                onClick={() => onRemoveOption(qIndex, oIndex)}
                                disabled={question.options.length <= 2}
                                className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/50 dark:hover:text-red-500 transition-colors disabled:opacity-0 disabled:cursor-not-allowed"
                                aria-label="Remove this option"
                                title={question.options.length <= 2 ? "A question must have at least 2 options" : "Remove option"}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </label>
                    )
                })}
            </div>

             {/* --- Add Option Button --- */}
            <button
                type="button"
                onClick={() => onAddOption(qIndex)}
                className="mt-4 w-full text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-center space-x-1.5 transition-colors p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
            >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
            </button>
        </div>
      </div>
    </div>
  );
};


// ##################################################################
// ## MAIN COMPONENT: EditQuizPage ##
// ##################################################################

const EditQuizPage = ({ quizId, onNavigate }) => { 
    
    // --- Original State and Hooks (Preserved) ---
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    const { apiCall } = useAPI();
    const { user } = useAuth();
    
    // --- New State for Notifications (Replaces alert()) ---
    const [notification, setNotification] = useState({ show: false, message: '' });

    // --- Original useEffect (Preserved) ---
    useEffect(() => {
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const data = await apiCall(`/quiz/${quizId}`);
                setTitle(data.title);

                setQuestions(data.questionList.map(q => ({
                    text: q.text,
                    options: q.options,
                    correctAnswerIndex: q.correctAnswerIndex === 1000 ? null : q.correctAnswerIndex
                })));
            } catch (err) {
                console.error("Failed to fetch quiz:", err);
                setError("Failed to load quiz data. It may not exist or you don't have permission.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, apiCall]);

    // --- All Original Handlers (Preserved) ---
    const addQuestion = () => {
      setQuestions([...questions, {
        text: '',
        options: ['', ''],
        correctAnswerIndex: null
      }]);
    };
  
    const updateQuestion = (index, field, value) => {
      const updated = [...questions];
      updated[index][field] = value;
      setQuestions(updated);
    };
  
    const updateOption = (qIndex, oIndex, value) => {
      const updated = [...questions];
      updated[qIndex].options[oIndex] = value;
      setQuestions(updated);
    };
  
    const removeQuestion = (index) => {
      if (questions.length <= 1) return;
      setQuestions(questions.filter((_, i) => i !== index));
    };

    const addOption = (qIndex) => {
      const updated = [...questions];
      updated[qIndex].options.push('');
      setQuestions(updated);
    };

    const removeOption = (qIndex, oIndex) => {
      const updated = [...questions];
      const question = updated[qIndex];
      if (question.options.length <= 2) return; 
      question.options.splice(oIndex, 1);
      if (question.correctAnswerIndex === oIndex) {
        question.correctAnswerIndex = null;
      } else if (question.correctAnswerIndex > oIndex) {
        question.correctAnswerIndex -= 1;
      }
      setQuestions(updated);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
  
      try {
        const payload = {
          title,
          username: user.username,
          questionList: questions.map(q => ({
            text: q.text,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex === null ? 1000 : q.correctAnswerIndex
          }))
        };
        await apiCall(`/quiz/${quizId}/edit`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        onNavigate('dashboard');
      } catch (err) {
        console.error("Failed to update quiz:", err);
        setNotification({ show: true, message: 'Failed to save changes. Please try again.' });
      } finally {
        setSaving(false);
      }
    };
    
    // --- Loading and Error States ---
    if (loading) {
        return <FullPageLoader />;
    }
    if (error) {
        return <FullPageError error={error} onNavigate={onNavigate} />;
    }

    // --- Main Re-styled JSX ---
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black font-sans">
        <form onSubmit={handleSubmit}>
            
            {/* --- Sticky Header --- */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* --- Left Side (Back button) --- */}
                        <button
                            type="button"
                            onClick={() => onNavigate('dashboard')}
                            disabled={saving}
                            className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Dashboard
                        </button>
                        
                        {/* --- Right Side (Actions) --- */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onNavigate('dashboard')}
                                disabled={saving}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || loading}
                                className="flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 mr-1.5" />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
  
            {/* --- Main Content Area --- */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-8 pb-20">
                    
                    {/* --- Quiz Title Input --- */}
                    <input
                        id="quiz-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-0 py-3 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 bg-transparent border-none focus:ring-0 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        placeholder="Untitled Quiz"
                        required
                    />
                    
                    {/* --- Questions List --- */}
                    {questions.map((q, qIndex) => (
                        <QuestionEditor
                        key={qIndex}
                        qIndex={qIndex}
                        question={q}
                        onRemoveQuestion={removeQuestion}
                        onUpdateQuestion={updateQuestion}
                        onUpdateOption={updateOption}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                        isLastQuestion={questions.length <= 1}
                        />
                    ))}
        
                    {/* --- Add Question Button --- */}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full mt-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center justify-center space-x-2 bg-white/30 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-900"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Question</span>
                    </button>
                </div>
            </main>
        </form>

        {/* --- Notification Area --- */}
        {notification.show && (
            <Notification 
            message={notification.message} 
            onClose={() => setNotification({ show: false, message: '' })} 
            />
        )}
      </div>
    );
};

export default EditQuizPage;