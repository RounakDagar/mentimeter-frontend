import React, { useState } from 'react';
import { Users } from 'lucide-react';

const JoinSessionPage = ({ onNavigate }) => {
    const [joinCode, setJoinCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
  
    const handleJoin = (e) => {
      e.preventDefault();
      if (joinCode.length === 6 && name.trim()) {
        onNavigate('participant', { joinCode, name });
      } else {
        setError('Please enter a valid join code and name');
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join Quiz</h1>
            <p className="text-gray-600 mt-2">Enter the code to participate</p>
          </div>
  
          <form onSubmit={handleJoin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500"
                placeholder="ABC123"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your name"
                required
              />
            </div>
  
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700"
            >
              Join Session
            </button>
          </form>
  
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
};

export default JoinSessionPage;