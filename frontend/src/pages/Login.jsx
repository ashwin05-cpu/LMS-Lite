import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { GraduationCap, Lock, User, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(credential, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleDemoSelect = (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (creds) {
      setCredential(creds.username);
      setPassword(creds.password);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign in to LMS Lite</h1>
        <p className="text-xs text-slate-500">
          Enter your Username, Email, or Student ID to continue
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Username, Email, or Student ID
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="e.g. student_emma, emma@lmslite.edu, or STU-2026-001"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill Box */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Demo Fill (Click to autofill):</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {Object.entries(DEMO_CREDENTIALS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleDemoSelect(key)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-medium text-left truncate transition-colors"
            >
              {key.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Register here
        </Link>
      </div>
    </div>
  );
}
