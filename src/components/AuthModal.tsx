import React, { useState } from 'react';
import { X, Lock, User, Mail, Shield, Film, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../services/api.ts';
import { User as UserType } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialTab) {
      setIsLogin(initialTab === 'login');
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(username.trim(), password);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          username: username.trim(),
          password,
          email: email.trim() || undefined,
        });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo login helper
  const handleQuickLogin = async (user: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(user, pass);
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12141c] border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header with Custom Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src="/assets/aistudio/IMG-20261109-WA0021_df2e63fc.jpg"
            alt="MOVIE PANEL BD"
            className="w-14 h-14 object-contain rounded-lg shadow-lg"
          />
          <h2 className="font-display text-xl font-extrabold text-white">
            {isLogin ? 'Sign In to MOVIE PANEL BD' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isLogin
              ? 'Access your personal watch history, playlists & favorites'
              : 'Join Bangladesh’s premier movie streaming & uploading platform'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`py-2 rounded-md transition-all cursor-pointer ${
              isLogin ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`py-2 rounded-md transition-all cursor-pointer ${
              !isLogin ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Username {isLogin && 'or Email'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'e.g. admin or viewer_anika' : 'Choose a unique username'}
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Email Address <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        {/* 1-Click Demo Accounts Strip */}
        <div className="pt-2 border-t border-zinc-800/80">
          <p className="text-[11px] font-semibold text-zinc-400 mb-2 text-center uppercase tracking-wider">
            Quick 1-Click Demo Logins:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-400 rounded-lg font-medium transition-colors cursor-pointer text-center"
            >
              <Shield className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('creator_rahim', 'rahim123')}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-red-500/30 text-red-400 rounded-lg font-medium transition-colors cursor-pointer text-center"
            >
              <Film className="w-3.5 h-3.5 mx-auto mb-1 text-red-400" />
              <span>Creator</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('viewer_anika', 'anika123')}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors cursor-pointer text-center"
            >
              <User className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-400" />
              <span>Viewer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
