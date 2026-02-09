
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { ArrowRight, Brain } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center">
        <div className="bg-primary-50 p-8 rounded-full mb-8 shadow-sm">
          <Brain className="w-16 h-16 text-primary-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          {isSignUp ? 'Create Your Second Brain' : 'Welcome Back'}
        </h2>
        
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          Your personal AI assistant to remember everything.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="w-full space-y-4 mb-8">
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button 
          onClick={handleAuth}
          className="w-full bg-gray-900 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center group"
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-gray-500">
          {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 font-semibold text-primary-600 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
