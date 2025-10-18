import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

const CreateQuizModal = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0
    }]);
    const { apiCall } = useAPI();
    const { user } = useAuth(); // 2. Get the user object
    const [loading, setLoading] = useState(false);
  
    const addQuestion = () => {
      setQuestions([...questions, {
        text: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0
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
      setQuestions(questions.filter((_, i) => i !== index));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const quiz = await apiCall('/quiz', {
          method: 'POST',
          body: JSON.stringify({
            title,
            questionList: questions,
            username: user.username // 3. Add username to the payload
          })
        });
        onSuccess(quiz);
      } catch (err) {
        alert('Failed to create quiz');
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
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
  
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                    placeholder="Enter question"
                    required
                  />
  
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={q.correctAnswerIndex === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-600 dark:border-slate-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
  
            <button
              type="button"
              onClick={addQuestion}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            >
              + Add Question
            </button>
  
            <div className="flex space-x-4 mt-6">
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default CreateQuizModal;