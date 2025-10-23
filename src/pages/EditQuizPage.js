import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';
import { Loader2, Save, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';

// ##################################################################
// ## SUB-COMPONENT: QuestionEditor ##
// ##################################################################
// Reworked for a cleaner, more modern card feel.
// ##################################################################

const QuestionEditor = ({ 
  question, 
  index, 
  onQuestionChange, 
  onOptionChange, 
  onCorrectAnswerChange, 
  onAddOption, 
  onRemoveOption, 
  onRemoveQuestion 
}) => {
  return (
    // A more distinct card with a subtle shadow
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-150 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <label className="block text-lg font-semibold text-gray-800 dark:text-slate-100">
          Question {index + 1}
        </label>
        <button
          type="button"
          onClick={() => onRemoveQuestion(index)}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          aria-label="Remove this question"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <textarea
        value={question.text}
        onChange={(e) => onQuestionChange(index, e.target.value)}
        placeholder="e.g., What is the capital of France?"
        className="w-full p-3 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
        rows="3"
        required
      />

      <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-5 mb-3 uppercase tracking-wider">
        Options
      </h4>
      
      {/* Option Inputs */}
      <div className="space-y-3">
        {question.options.map((option, oIndex) => (
          <div key={oIndex} className="flex items-center space-x-2 group">
            <input
              type="radio"
              name={`correct-answer-${index}`}
              checked={question.correctAnswer === oIndex}
              onChange={() => onCorrectAnswerChange(index, oIndex)}
              className="form-radio h-5 w-5 text-indigo-600 dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 cursor-pointer"
              title="Mark as correct answer"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => onOptionChange(index, oIndex, e.target.value)}
              placeholder={`Option ${oIndex + 1}`}
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              required
            />
            {question.options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(index, oIndex)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove this option"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Option Button */}
      {question.options.length < 6 && (
        <button
          type="button"
          onClick={() => onAddOption(index)}
          className="mt-4 flex items-center space-x-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors rounded-md p-1 -ml-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Option</span>
        </button>
      )}
    </div>
  );
};


// ##################################################################
// ## MAIN COMPONENT: EditQuizPage ##
// ##################################################################
// Reworked with a 2-column sticky layout.
// ##################################################################

const EditQuizPage = ({ quizId, onNavigate }) => {
  const { apiCall } = useAPI();
  
  // --- State (Logic Unchanged) ---
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch Logic (Unchanged) ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiCall(`/quiz/${quizId}`); 
        setTitle(data.title);
        setQuestions(data.questionList || []); 
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError("Could not load quiz data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, apiCall]); 
  
  // --- Handler Functions (Logic Unchanged) ---
  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', ''], correctAnswer: 0 }]);
  };
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  const handleQuestionChange = (index, text) => {
    const newQuestions = questions.map((q, i) => i === index ? { ...q, text } : q);
    setQuestions(newQuestions);
  };
  const addOption = (qIndex) => {
    const newQuestions = questions.map((q, i) => i === qIndex ? { ...q, options: [...q.options, ''] } : q);
    setQuestions(newQuestions);
  };
  const removeOption = (qIndex, oIndex) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newCorrectAnswer = q.correctAnswer === oIndex ? 0 : q.correctAnswer;
      return { ...q, options: q.options.filter((_, oi) => oi !== oIndex), correctAnswer: newCorrectAnswer };
    });
    setQuestions(newQuestions);
  };
  const handleOptionChange = (qIndex, oIndex, text) => {
    const newQuestions = questions.map((q, i) => i === qIndex ? { ...q, options: q.options.map((opt, oi) => oi === oIndex ? text : opt) } : q);
    setQuestions(newQuestions);
  };
  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const newQuestions = questions.map((q, i) => i === qIndex ? { ...q, correctAnswer: oIndex } : q);
    setQuestions(newQuestions);
  };

  // --- Submit Logic (Unchanged) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (isSaving) return;
    if (questions.length === 0) {
      setError("A quiz must have at least one question.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const quizDTO = { title, questionList: questions };
      await apiCall(`/quiz/${quizId}/edit`, {
        method: 'PUT',
        body: JSON.stringify(quizDTO)
      });
      onNavigate('dashboard'); 
    } catch (err) {
      console.error("Failed to update quiz:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Loading State (Unchanged) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  // --- Render JSX (New Layout) ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sticky Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 truncate">
            Edit: <span className="font-normal">{title || 'Untitled Quiz'}</span>
          </h1>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>
      
      {/* Form with 2-column layout */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:gap-8">

          {/* --- Left Column (Sticky) --- */}
          {/* This column contains the title and the main form actions. */}
          <aside className="md:w-1/3 lg:w-1/4 md:sticky md:top-24 h-fit">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  required
                />
              </div>

              <hr className="dark:border-slate-700" />

              {/* Form Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-800"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  disabled={isSaving}
                  className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </aside>

          {/* --- Right Column (Scrollable) --- */}
          {/* This column contains the dynamic list of questions. */}
          <main className="md:w-2/3 lg:w-3/4 mt-8 md:mt-0">
            
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg text-sm font-medium mb-6">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {questions.map((q, index) => (
                <QuestionEditor
                  key={index} 
                  index={index}
                  question={q}
                  onQuestionChange={handleQuestionChange}
                  onOptionChange={handleOptionChange}
                  onCorrectAnswerChange={handleCorrectAnswerChange}
                  onAddOption={addOption}
                  onRemoveOption={removeOption}
                  onRemoveQuestion={removeQuestion}
                />
              ))}

              {/* Modern "Add" button */}
              <button
                type="button"
                onClick={addQuestion}
                className="w-full flex items-center justify-center space-x-2 p-6 text-sm font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Question</span>
              </button>
            </div>
          </main>

        </div>
      </form>
    </div>
  );
};

export default EditQuizPage;