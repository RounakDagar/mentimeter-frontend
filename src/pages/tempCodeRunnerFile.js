import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';

// ##################################################################
// ## SUB-COMPONENT: QuestionEditor (Extracted for clarity) ##
// ##################################################################
// This component handles the UI for a *single* question.
// This makes the main modal component much cleaner.
// ##################################################################

const QuestionEditor = ({
  question,
  qIndex,
  onRemoveQuestion,
  onUpdateQuestion,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  isLastQuestion, // To hide the "remove" button on the last question
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 dark:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Question {qIndex + 1}
        </h3>
        {/* Don't allow removing the very last question */}
        {!isLastQuestion && (
          <button
            type="button"
            onClick={() => onRemoveQuestion(qIndex)}
            className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <textarea // Changed from input to textarea for more space
        value={question.text}
        onChange={(e) => onUpdateQuestion(qIndex, 'text', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
        placeholder="Enter question"
        rows="2"
        required
      />

      {/* "Clear Answer" button for the "0 correct answers" feature */}
      <div className="flex justify-between items-center mt-4 mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">
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

      {/* Dynamic options list */}
      <div className="space-y-2">
        {question.options.map((opt, oIndex) => (
          <div key={oIndex} className="flex items-center space-x-2 group">
            <input
              type="radio"
              name={`correct-answer-${qIndex}`} // Added name for proper radio group behavior
              checked={question.correctAnswerIndex === oIndex}
              onChange={() => onUpdateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-600 dark:border-slate-500"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => onUpdateOption(qIndex, oIndex, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder={`Option ${oIndex + 1}`}
              required
            />
            {/* "Remove Option" button, visible only if > 2 options */}
            {question.options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(qIndex, oIndex)}
                className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove this option"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* "Add Option" button */}
      <button
        type="button"
        onClick={() => onAddOption(qIndex)}
        className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center space-x-1"
      >
        <Plus className="w-4 h-4" />
        <span>Add Option</span>
      </button>
    </div>
  );
};


// ##################################################################
// ## MAIN COMPONENT: CreateQuizModal ##
// ##################################################################

const CreateQuizModal = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    // Updated default state for questions
    const [questions, setQuestions] = useState([{
      text: '',
      options: ['', ''], // Start with 2 options
      correctAnswerIndex: null // Start with null (no correct answer)
    }]);
    const { apiCall } = useAPI();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
  
    // Updated to new default
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
      // Prevent removing the last question
      if (questions.length <= 1) return;
      setQuestions(questions.filter((_, i) => i !== index));
    };

    // NEW: Add Option handler
    const addOption = (qIndex) => {
      const updated = [...questions];
      updated[qIndex].options.push('');
      setQuestions(updated);
    };

    // NEW: Remove Option handler
    const removeOption = (qIndex, oIndex) => {
      const updated = [...questions];
      const question = updated[qIndex];

      // Enforce minimum 2 options
      if (question.options.length <= 2) {
        return; 
      }

      // Remove the option
      question.options.splice(oIndex, 1);

      // Fix correct answer index if it's affected
      if (question.correctAnswerIndex === oIndex) {
        // If removed option was correct, reset
        question.correctAnswerIndex = null;
      } else if (question.correctAnswerIndex > oIndex) {
        // If removed option was *before* correct one, shift index
        question.correctAnswerIndex -= 1;
      }

      setQuestions(updated);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        // This payload matches the DTO format from your other components
        // (e.g., `correctAnswer` as an integer)
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
        console.error("Failed to create quiz:", err); // Log the error
        alert('Failed to create quiz. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 dark:bg-slate-800">
          <div className="p-6 border-b dark:border-slate-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Create New Quiz</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Enter quiz title"
                required
              />
            </div>
  
            <div className="space-y-6">
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
            </div>
  
            <button
              type="button"
              onClick={addQuestion}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Question</span>
            </button>
  
            <div className="flex space-x-4 mt-6 pt-6 border-t dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? 'Creating...' : 'Create Quiz'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default CreateQuizModal;