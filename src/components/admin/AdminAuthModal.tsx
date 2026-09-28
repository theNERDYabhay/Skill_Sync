import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { Shield, ShieldAlert, Key, Lock, Mail, User, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { showAdminAuthModal, setShowAdminAuthModal, loginAdmin, signupAdmin } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign in state
  const [loginEmail, setLoginEmail] = useState('admin@skillsync.io');
  const [loginKey, setLoginKey] = useState('admin2026');

  // Sign up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupHeadline, setSignupHeadline] = useState('Platform Operations & Trust Lead');
  const [signupKey, setSignupKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!showAdminAuthModal) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await loginAdmin({
        email: loginEmail.trim() || undefined,
        adminSecretKey: loginKey.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrator authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (!signupName.trim() || !signupEmail.trim() || !signupKey.trim()) {
        throw new Error('Please fill in all required fields including Admin Security Key');
      }
      await signupAdmin({
        name: signupName.trim(),
        email: signupEmail.trim(),
        headline: signupHeadline.trim(),
        adminSecretKey: signupKey.trim(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin account creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-purple-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Staff Administration Portal</h3>
              <p className="text-[11px] text-slate-500">Restricted staff access & platform management</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdminAuthModal(false)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Specific Admin Sign Up */}
        <div className="mt-4 flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Specific Admin Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode 1: Sign In */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="mt-4 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Staff / Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@skillsync.io"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Admin Security Passkey</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={loginKey}
                  onChange={(e) => setLoginKey(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="bg-purple-50/70 border border-purple-100 p-2.5 rounded-xl text-[11px] text-purple-900 flex items-center justify-between">
              <span>Default Master Key: <strong>admin2026</strong></span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@skillsync.io');
                  setLoginKey('admin2026');
                }}
                className="font-bold underline text-purple-700 hover:text-purple-800"
              >
                Autofill
              </button>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdminAuthModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? 'Verifying...' : 'Authenticate Admin'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: Specific Admin Sign Up */
          <form onSubmit={handleSignUp} className="mt-4 space-y-3">
            <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl text-[11px] text-blue-900">
              <strong>Staff Onboarding:</strong> Admin accounts require the valid organizational Admin Security Key to prevent unauthorized privilege escalation.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Official Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="jordan@skillsync.io"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Staff Role / Title</label>
              <input
                type="text"
                value={signupHeadline}
                onChange={(e) => setSignupHeadline(e.target.value)}
                placeholder="e.g. Security & Safety Supervisor"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Admin Authorization Key</label>
                <button
                  type="button"
                  onClick={() => setSignupKey('admin2026')}
                  className="text-[10px] text-purple-700 font-semibold underline"
                >
                  Use Default Key (admin2026)
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={signupKey}
                  onChange={(e) => setSignupKey(e.target.value)}
                  placeholder="Enter required authorization key"
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdminAuthModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{loading ? 'Provisioning...' : 'Complete Admin Registration'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
