import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  Factory,
  Lock,
  Mail,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isServerOnline, serverLatency, checkBackendStatus, currentApiUrl, setApiUrl } =
    useAuthStore();
  const { addToast } = useNotificationStore();

  const [email, setEmail] = useState('admin@textile.local');
  const [password, setPassword] = useState('Admin@123!');
  const [testingPing, setTestingPing] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, [checkBackendStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: result.offlineNotice
          ? 'Signed in with demo verification (Backend offline mode).'
          : 'Authenticated securely with JWT token.',
      });
      navigate('/dashboard');
    } else {
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: result.error || 'Please check your credentials.',
      });
    }
  };


  const handlePingServer = async () => {
    setTestingPing(true);
    const health = await checkBackendStatus();
    setTestingPing(false);
    if (health.online) {
      addToast({
        type: 'success',
        title: 'Backend Online',
        message: `Connected to ${currentApiUrl} (${health.latency}ms)`,
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Backend Offline',
        message: `Could not reach ${currentApiUrl}. Demo verification fallback will be used automatically.`,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Left side: Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Factory className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">EVEREST TEXTILE MILLS</h1>
              <p className="text-xs uppercase tracking-widest text-blue-400 font-medium">
                Integrated Manufacturing ERP System
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              One Unified Software Platform to Replace Notebooks & Phone Calls.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              Manage the complete textile lifecycle from raw yarn receiving, spinning, airjet weaving, and vat dyeing,
              to quality inspection, defect traceability, warehouse dispatch, and real-time order costing.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase">
              <Sparkles className="h-4 w-4" />
              <span>End-to-End Traceability</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Roll R-102 → Order ORD-25 → Machine W-07 → Operator O-15 defect audit.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
              <CheckCircle2 className="h-4 w-4" />
              <span>Quality Control Rule</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Strict business constraint: rolls failing inspection cannot be dispatched.
            </p>
          </div>
        </div>

        {/* Backend Target Indicator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-300">Target Backend API</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isServerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-medium text-slate-400">
                {isServerOnline ? `Online (${serverLatency}ms)` : 'Offline Fallback'}
              </span>
            </div>
          </div>
          <p className="mt-1.5 font-mono text-xs text-blue-300">{currentApiUrl}</p>
        </div>
      </div>

      {/* Right side: Login Form & Role Quick Launch */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 bg-slate-900">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">EVEREST TEXTILE MILLS</h2>
              <p className="text-[11px] text-blue-400">Textile Manufacturing ERP</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Sign In to Mill Portal</h3>
            <p className="mt-1.5 text-xs text-slate-400">
              Access floor management, raw materials, looms, QA, or buyer portal.
            </p>
          </div>

          {/* Server status pill + quick switcher */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isServerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-medium text-slate-300">
                {isServerOnline ? 'Backend Connected' : 'Demo Fallback Ready'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setApiUrl(currentApiUrl.includes('localhost') ? 'http://172.17.40.17:5000/api' : 'http://localhost:5000/api')}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                Switch to {currentApiUrl.includes('localhost') ? '172.17.40.17' : 'localhost'}
              </button>
              <button
                type="button"
                onClick={handlePingServer}
                disabled={testingPing}
                title="Ping server"
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${testingPing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-800/40 bg-rose-950/40 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@textile.local"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus:outline-none transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In (Owner / Admin)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
