import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  AlertTriangle, 
  Loader2, 
  Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = ({ onNavigate }) => {
  // --- All original logic is 100% unchanged ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  // --- End of original logic ---

  return (
    <>
      {/* Full-screen animated gradient background (UPDATED COLORS) */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans cohesive-gradient-bg">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl mb-5 shadow-lg border border-white/30">
              <Users className="w-10 h-10 text-white" />
            </div>
            {/* Text shadow for contrast (Unchanged) */}
            <h1 className="text-4xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
              IntelliQuiz
            </h1>
            <p className="text-gray-200/90 mt-2 text-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
              Interactive Live Quizzes
            </p>
          </div>

          {/* Glass Form Panel (Unchanged, already good contrast) */}
          <div className="bg-black/20 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/40 border border-red-600/50 text-white px-4 py-3 rounded-lg text-sm flex items-center shadow-inner"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Input (Unchanged, already good contrast) */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <User className="w-5 h-5 text-white/60" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/30 text-white border-none rounded-lg focus:ring-2 focus:ring-white/60 transition placeholder:text-gray-300/70"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {/* Password Input (Unchanged, already good contrast) */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="w-5 h-5 text-white/60" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/30 text-white border-none rounded-lg focus:ring-2 focus:ring-white/60 transition placeholder:text-gray-300/70"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Login Button (Unchanged, already good contrast) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-white text-indigo-700 py-3 px-4 rounded-lg font-semibold text-base shadow-lg hover:bg-gray-100 transition disabled:opacity-70 disabled:bg-gray-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
          
          {/* Sign Up Link (Text shadow for contrast) */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-semibold text-white hover:text-white/80 focus:outline-none focus:underline transition [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* This style tag contains the CSS for the animated gradient background */}
      <style>{`
        .cohesive-gradient-bg {
          background: linear-gradient(-45deg, #0A1931, #1A2E59, #3A4E8A, #2C3E50); /* Darker, more cohesive cool tones */
          background-size: 400% 400%;
          animation: gradient-move 20s ease infinite;
        }

        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
          input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-text-fill-color: #FFFFFF !important; /* Forces text to be white */
            -webkit-box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.3) inset !important; /* Fakes the 'bg-black/30' */
            transition: background-color 5000s ease-in-out 0s; /* Delays browser style change */
            caret-color: #FFFFFF !important; /* Ensures the typing caret is white */
        }
      `}</style>
    </>
  );
};
  
export default LoginPage;