import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import {
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
      const isBuyer = email.toLowerCase().includes('buyer') || useAuthStore.getState().activeRole === 'BUYER';
      navigate(isBuyer ? '/buyer-portal' : '/dashboard');
    } else {
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: result.error || 'Please check your credentials.',
      });
    }
  };
  const handleQuickRole = async (role) => {
    // Map roles to mock emails for now, assuming authService handles it or backend has these
    const roleEmails = {
      ADMIN: 'admin@textile.local',
      PRODUCTION_MANAGER: 'production@textile.local',
      STORE_MANAGER: 'store@textile.local',
      QUALITY_INSPECTOR: 'quality@textile.local',
      ACCOUNTANT: 'accountant@textile.local',
      BUYER: 'buyer@textile.local',
    };
    const emailToUse = roleEmails[role] || 'admin@textile.local';
    const result = await login(emailToUse, 'Admin@123!');
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Signed in as ${role}`,
      });
      navigate(role === 'BUYER' ? '/buyer-portal' : '/dashboard');
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
    <div className="flex min-h-screen bg-[#ecf7f9] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-xl shadow-cyan-950/5 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Pastel Cyan Showcase Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#00bcd4] via-[#00acc1] to-[#0097a7] p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            {/* Avatar / Brand Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-xs ring-2 ring-white/40 mb-6">
              <span className="text-2xl font-black text-amber-300">🏭</span>
            </div>

            <span className="rounded-full bg-white/25 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
              Everest Textile Mills
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white mt-3 leading-snug">
              Smart Textile Manufacturing ERP
            </h1>
            <p className="text-xs text-cyan-50 mt-2 leading-relaxed">
              Unified software platform replacing notebooks and phone calls across Spinning, Weaving, Dyeing, Quality Control, and Dispatch.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-xs text-xs">
              <span className="font-bold text-amber-200 block">End-to-End Traceability</span>
              <p className="text-[11px] text-cyan-50 mt-0.5">
                Roll R-102 ➔ Order ORD-25 ➔ Machine W-07 ➔ Operator O-15 defect audit.
              </p>
            </div>

            {/* Target Server info */}
            <div className="rounded-2xl bg-white/10 p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-100" />
                <span className="font-mono text-[11px] text-cyan-100">{currentApiUrl.includes('172.17') ? '172.17.40.17' : 'localhost:5000'}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isServerOnline ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>
                {isServerOnline ? 'Online' : 'Demo Fallback'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean White Login & 1-Click Test Personas */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Welcome Back</h2>
                <p className="text-xs text-slate-400 mt-0.5">Sign in to access your mill floor workspace</p>
              </div>

              {/* Server toggle */}
              <button
                type="button"
                onClick={() => setApiUrl(currentApiUrl.includes('localhost') ? 'http://172.17.40.17:5000/api' : 'http://localhost:5000/api')}
                className="text-[11px] font-semibold text-[#00acc1] hover:underline"
              >
                Switch to {currentApiUrl.includes('localhost') ? '172.17.40.17' : 'localhost'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@textile.local"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-[#00bcd4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600">Password</label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-[#00bcd4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#00bcd4] hover:bg-[#00acc1] py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
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

          {/* 1-Click Reviewer Logins */}
          <div className="mt-8 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                1-Click Reviewer Test Logins
              </span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold text-[#00acc1]">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickRole('ADMIN')}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:border-[#00bcd4] hover:bg-cyan-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-800 text-[11px]">Admin / Owner</div>
                <div className="text-[10px] text-slate-400">Full Mill Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('PRODUCTION_MANAGER')}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:border-[#00bcd4] hover:bg-cyan-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-800 text-[11px]">Production Mgr</div>
                <div className="text-[10px] text-slate-400">Looms & Floor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('STORE_MANAGER')}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:border-[#00bcd4] hover:bg-cyan-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-800 text-[11px]">Store Manager</div>
                <div className="text-[10px] text-slate-400">Yarn & Warehouse</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('QUALITY_INSPECTOR')}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:border-[#00bcd4] hover:bg-cyan-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-800 text-[11px]">Quality Inspector</div>
                <div className="text-[10px] text-slate-400">Rolls & Defects</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('ACCOUNTANT')}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:border-[#00bcd4] hover:bg-cyan-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-800 text-[11px]">Accountant</div>
                <div className="text-[10px] text-slate-400">Cost & Wages</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('BUYER')}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5 hover:border-[#00bcd4] hover:bg-cyan-50/50 text-left transition-all"
              >
                <div className="font-bold text-slate-800 text-[11px]">Buyer Portal</div>
                <div className="text-[10px] text-slate-400">Track ORD-1024</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



