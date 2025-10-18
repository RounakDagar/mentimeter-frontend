import React, { useState } from 'react';
import { Users, Loader2 } from 'lucide-react'; // Added Loader2 for loading state
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI'; // Import useAPI

const JoinSessionPage = ({ onNavigate }) => {
    const { user } = useAuth();
    const { apiCall } = useAPI(); // Get the apiCall function
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState('');
  
    const handleJoin = async (e) => {
      e.preventDefault();
      
      if (!user || !user.username) {
        setError('You must be logged in to join a session.');
        return;
      }
      
      if (joinCode.length !== 6) {
        setError('Please enter a valid 6-character join code.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Step 1: Validate the session with an HTTP call first
        await apiCall(`/sessions/${joinCode}/validate`, { method: 'GET' });

        // Step 2: If validation succeeds, navigate to the participant page
        onNavigate('participant', { joinCode, name: user.username });

      } catch (err) {
        // Step 3: If validation fails, show the error on *this* page
        console.error("Failed to validate session:", err);
        setError('Session not found or is inactive. Please check the code.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 dark:bg-slate-800">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Join Quiz</h1>
            <p className="text-gray-600 mt-2 dark:text-slate-400">
              Joining as <span className="font-bold text-indigo-700 dark:text-indigo-400">{user?.username || '...'}</span>
            </p>
          </div>
  
          <form onSubmit={handleJoin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/50 dark:border-red-700/50 dark:text-red-400">
                {error}
              </div>
            )}
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Join Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="ABC123"
                required
              />
            </div>
  
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Join Session'
              )}
            </button>
          </form>
  
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full mt-4 text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
};

export default JoinSessionPage;