import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Radio, Check, X, ExternalLink, RefreshCw, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { getLiveStreamConfig, updateLiveStreamConfig, DEFAULT_MAKKAH_STREAM, DEFAULT_MADINAH_STREAM } from '../services/liveStreamService';
import { useToast } from './ToastContext';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_SECRET = 'Danish@8587';

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { showSuccess, showError, showInfo } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Live stream URLs
  const [makkahUrl, setMakkahUrl] = useState(DEFAULT_MAKKAH_STREAM);
  const [madinahUrl, setMadinahUrl] = useState(DEFAULT_MADINAH_STREAM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check if session has admin unlocked
      const sessionAuth = sessionStorage.getItem('nur_admin_authenticated');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
        loadCurrentConfig();
      } else {
        setIsAuthenticated(false);
        setPassword('');
        setPasswordError(false);
      }
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    setLoading(true);
    try {
      const config = await getLiveStreamConfig();
      setMakkahUrl(config.makkahUrl);
      setMadinahUrl(config.madinahUrl);
      if (config.updatedAt) {
        setLastUpdated(new Date(config.updatedAt).toLocaleString());
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAuthenticated(true);
      setPasswordError(false);
      sessionStorage.setItem('nur_admin_authenticated', 'true');
      showSuccess('Admin access granted! Welcome Danish.');
      loadCurrentConfig();
    } else {
      setPasswordError(true);
      showError('Incorrect admin password.');
    }
  };

  const handleSaveUrls = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!makkahUrl.trim()) {
      showError('Makkah YouTube Live link cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await updateLiveStreamConfig(makkahUrl.trim(), madinahUrl.trim());
      setLastUpdated(new Date().toLocaleString());
      showSuccess('Live Stream URL successfully updated for all users!');
    } catch (err: any) {
      showError(err?.message || 'Failed to update live stream URL');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setMakkahUrl(DEFAULT_MAKKAH_STREAM);
    setMadinahUrl(DEFAULT_MADINAH_STREAM);
    showInfo('Reset to default official live streams');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors active:scale-95"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  Admin Control Panel
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Secret
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">Broadcast Management & Stream Controls</p>
              </div>
            </div>
            
            {/* Prominent Cross Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-2xl transition-colors active:scale-95"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {!isAuthenticated ? (
            /* PASSWORD AUTHENTICATION SCREEN */
            <form onSubmit={handleLogin} className="py-6 space-y-5">
              <div className="text-center space-y-2 py-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock size={28} />
                </div>
                <h3 className="font-black text-slate-800 text-base">Enter Admin Password</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  This protected panel allows the administrator to configure real-time YouTube streams for Makkah and Madinah.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter administrator password..."
                  className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all outline-none ${
                    passwordError 
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200' 
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800'
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-semibold">
                    <AlertCircle size={13} />
                    Invalid admin password. Please try again.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          ) : (
            /* ADMIN CONFIGURATION FORM */
            <form onSubmit={handleSaveUrls} className="py-5 space-y-5">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <Sparkles size={18} className="text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-800 font-medium">
                  Logged in as <span className="font-bold">Admin</span>. Any link you paste below will immediately be shown in the <span className="font-bold">Live Stream</span> section for all app users!
                </div>
              </div>

              {/* Makkah Live Link Input */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Radio size={14} className="text-rose-500 animate-pulse" />
                    Paste Makkah Live YouTube Link
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium lowercase">
                    e.g. https://www.youtube.com/watch?v=...
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={makkahUrl}
                    onChange={(e) => setMakkahUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                  {makkahUrl && (
                    <a
                      href={makkahUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Preview in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Madinah Live Link Input */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Radio size={14} className="text-emerald-500" />
                    Paste Madinah Live YouTube Link (Optional)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium lowercase">
                    YouTube URL
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={madinahUrl}
                    onChange={(e) => setMadinahUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                  {madinahUrl && (
                    <a
                      href={madinahUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Preview in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {lastUpdated && (
                <p className="text-[10px] text-slate-400 font-medium text-right">
                  Last updated: {lastUpdated}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save & Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
