import React, { useState } from 'react';
import { Shield, KeyRound, Eye, EyeOff, X, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  panelType: 'admin' | 'moderator';
  onSuccess: (user: User) => void;
}

export const PasskeyModal: React.FC<PasskeyModalProps> = ({
  isOpen,
  onClose,
  panelType,
  onSuccess,
}) => {
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!passkey.trim()) {
      setError('Please enter the security passkey.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyPasskey(passkey, panelType);
      if (res.success && res.user) {
        setSuccessMsg(`Access granted! Redirecting to ${panelType === 'admin' ? 'Admin' : 'Moderator'} Panel...`);
        setTimeout(() => {
          onSuccess(res.user);
          onClose();
          setPasskey('');
          setSuccessMsg(null);
        }, 600);
      } else {
        setError('Passkey verification failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid passkey. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const isModerator = panelType === 'moderator';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#121316] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle red ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mb-4 text-red-500 shadow-inner">
            {isModerator ? <Shield className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isModerator ? 'Moderator Panel Access' : 'Admin Panel Access'}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xs">
            Enter the authorized security passkey to access system management controls.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Security Passkey
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passkey (e.g. Devjyoti2003)"
                autoFocus
                className="w-full pl-10 pr-11 py-3 bg-neutral-900/90 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 flex items-center justify-between">
              <span>Default key: <code className="text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">Devjyoti2003</code></span>
              <span className="text-neutral-400">Changeable in Settings</span>
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Verify & Unlock {isModerator ? 'Moderator' : 'Admin'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-neutral-800/80 text-center">
          <p className="text-xs text-neutral-500">
            Confidential access. This entry is not exposed in public navigation menus.
          </p>
        </div>
      </div>
    </div>
  );
};
