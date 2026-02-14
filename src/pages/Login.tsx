import { useState } from 'react';
import { findUser, createUser, createGuestUser } from '../utils/storage';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (isLogin) {
      const user = findUser(username.trim(), password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password.');
      }
    } else {
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
      const user = createUser(username.trim(), password);
      if (user) {
        setSuccess('Account created! You can now sign in.');
        setIsLogin(true);
        setUsername('');
        setPassword('');
      } else {
        setError('Username already exists.');
      }
    }
  };

  const handleGuestLogin = () => {
    const guest = createGuestUser();
    onLogin(guest);
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated BG blobs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/40 mb-5 animate-float">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            CodeQuiz
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Test your programming knowledge</p>
        </div>

        {/* Card */}
        <div className="glass-light rounded-3xl p-8 shadow-2xl shadow-black/30">
          {/* Tabs */}
          <div className="flex mb-8 bg-white/5 rounded-2xl p-1.5">
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Enter your password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {success && (
              <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                <span>✅</span> {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-base hover:from-violet-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-violet-500/25 active:scale-[0.98] hover:shadow-xl hover:shadow-violet-500/30"
            >
              {isLogin ? '🚀 Sign In' : '✨ Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#1a1a3e] text-gray-500">or</span>
            </div>
          </div>

          {/* Guest Button */}
          <button
            onClick={handleGuestLogin}
            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span className="text-xl">👤</span>
            Continue as Guest
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">
            No registration needed • Your scores will still be saved
          </p>

        </div>
      </div>
    </div>
  );
}
