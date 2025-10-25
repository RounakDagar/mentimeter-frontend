// src/pages/CreateQuizModal.js
import React, { useState } from 'react';
import { 
    X, 
    Plus, 
    Loader2, 
    XCircle,    // For modal close
    FilePlus2,  // For modal header
    Trash2,     // For remove question/option
} from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';

// ##################################################################
// ## RE-STYLED SUB-COMPONENT: QuestionEditor ##
// (Now uses your original <input type="radio"> logic)
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
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
      {/* --- Question Header --- */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Question {qIndex + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemoveQuestion(qIndex)}
          disabled={isLastQuestion}
          className="p-2 rounded-full text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:opacity-50 transition-colors"
          title={isLastQuestion ? "Cannot remove the only question" : "Remove question"}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* --- Question Text (Textarea) --- */}
      <div className="mb-4">
          <label htmlFor={`q-text-${qIndex}`} className="sr-only">Question Text</label>
          <textarea
            id={`q-text-${qIndex}`}
            value={question.text}
            onChange={(e) => onUpdateQuestion(qIndex, 'text', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 transition"
            placeholder="e.g., What is the capital of France?"
            rows="2"
            required
          />
      </div>

      {/* --- Options Header --- */}
      <div className="flex justify-between items-center mt-5 mb-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Options (Select the correct answer)
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

      {/* --- Dynamic Options List --- */}
      <div className="space-y-3">
        {question.options.map((opt, oIndex) => (
            <div key={oIndex} className="flex items-center space-x-3 group">
                
                {/* --- THIS IS YOUR ORIGINAL <input> LOGIC --- */}
                <input
                  type="radio"
                  name={`correct-answer-${qIndex}`}
                  checked={question.correctAnswerIndex === oIndex}
                  onChange={() => onUpdateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                  className="w-4 h-4 flex-shrink-0 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                
                {/* --- Option Text Input --- */}
                <input
                    type="text"
                    value={opt}
                    onChange={(e) => onUpdateOption(qIndex, oIndex, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 transition"
                    placeholder={`Option ${oIndex + 1}`}
                    required
                />
                
                {/* --- Remove Option Button --- */}
                <button
                    type="button"
                    onClick={() => onRemoveOption(qIndex, oIndex)}
                    disabled={question.options.length <= 2}
                    className="p-1.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
                    aria-label="Remove this option"
                    title={question.options.length <= 2 ? "A question must have at least 2 options" : "Remove option"}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>

      {/* --- Add Option Button --- */}
      <button
        type="button"
        onClick={() => onAddOption(qIndex)}
        className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center space-x-1.5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Option</span>
      </button>
    </div>
  );
};


// ##################################################################
// ## RE-STYLED MAIN COMPONENT: CreateQuizModal ##
// ##################################################################

const CreateQuizModal = ({ onClose, onSuccess }) => {
    // --- All Original State and Logic (Preserved) ---
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{
      text: '',
      options: ['', ''],
      correctAnswerIndex: null
    }]);
    const { apiCall } = useAPI();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
  
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
      setLoading(true);
      try {
        const payload = {
          title,
          username: user.username,
          questionList: questions.map(q => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswerIndex === null ? 1000 : q.correctAnswerIndex
          }))
        };
        const quizData = await apiCall('/quiz', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        onSuccess(quizData);
      } catch (err) {
        console.error("Failed to create quiz:", err);
        alert('Failed to create quiz. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };
    // --- End of Original Logic ---

    // --- New Re-styled JSX ---
    return (
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start p-4 py-10 overflow-y-auto transition-opacity duration-300 font-sans"
        onClick={onClose}
      >
        <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl my-auto transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
            onClick={e => e.stopPropagation()}
        >
            {/* --- Modal Header --- */}
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                        <FilePlus2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Create New Quiz
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                    <XCircle className="w-6 h-6" />
                </button>
            </div>
  
          {/* --- Form with Scrollable Body --- */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              
              {/* --- Quiz Title --- */}
              <div>
                <label htmlFor="quiz-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quiz Title
                </label>
                <input
                  id="quiz-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 transition"
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              
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
                className="w-full mt-2 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Question</span>
              </button>
            </div>
  
            {/* --- Modal Footer --- */}
            <div className="flex justify-end items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                <span>{loading ? 'Creating...' : 'Create Quiz'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* --- Simple scale-in animation --- */}
        <style>{`
            @keyframes scaleIn { 
                from { opacity: 0; transform: scale(0.95); } 
                to { opacity: 1; transform: scale(1); } 
            }
            .animate-scale-in { 
                animation: scaleIn 0.2s ease-out forwards; 
            }
        `}</style>
      </div>
    );
};

export default CreateQuizModal;