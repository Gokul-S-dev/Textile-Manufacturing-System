import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  Settings,
  Server,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentApiUrl, setApiUrl, isServerOnline, serverLatency, checkBackendStatus } = useAuthStore();
  const { addToast } = useNotificationStore();

  const [inputUrl, setInputUrl] = useState(currentApiUrl);
  const [isPinging, setIsPinging] = useState(false);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    setIsPinging(true);
    const health = await setApiUrl(inputUrl);
    setIsPinging(false);

    if (health.online) {
      addToast({
        type: 'success',
        title: 'Backend Connected',
        message: `Successfully connected to ${inputUrl} (${health.latency}ms).`,
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Server Offline',
        message: `Could not reach ${inputUrl}. Demo mode fallback is active.`,
      });
    }
  };

  const handleQuickPreset = async (url) => {
    setInputUrl(url);
    setIsPinging(true);
    const health = await setApiUrl(url);
    setIsPinging(false);

    addToast({
      type: health.online ? 'success' : 'info',
      title: 'Target URL Updated',
      message: health.online
        ? `Connected to ${url} (${health.latency}ms).`
        : `Switched target to ${url}. Server offline; demo fallback active.`,
    });
  };

  const docsUrl = inputUrl.replace('/api', '/api-docs/#');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System & API Backend Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure backend API server endpoint, test server reachability, and inspect Swagger API documentation.
        </p>
      </div>

      {/* Backend Target Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend API Connection</h3>
              <p className="text-xs text-slate-500">Live Express REST API server target</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isServerOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span
              className={`text-xs font-semibold ${
                isServerOnline ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isServerOnline
                ? `Online (${serverLatency}ms latency)`
                : 'Demo Mode (Offline Fallback)'}
            </span>
          </div>
        </div>

        {/* URL Form */}
        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">API Base URL</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://172.17.40.17:5000/api"
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPinging}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test & Save</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Quick Presets:</span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('http://172.17.40.17:5000/api')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 hover:bg-slate-100"
              >
                172.17.40.17:5000 (User Network Target)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('http://localhost:5000/api')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 hover:bg-slate-100"
              >
                localhost:5000 (Local Dev Server)
              </button>
            </div>
          </div>
        </form>

        {/* Swagger Documentation Link */}
        <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-blue-900">Interactive Swagger API Documentation</h4>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Target address: <code className="font-mono">{docsUrl}</code>
            </p>
          </div>

          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shrink-0 shadow-sm"
          >
            <span>Open Swagger Docs</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Role & Security Configuration Info */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>Role-Based Access Control (RBAC) Architecture</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The system implements 6 specialized roles: <strong>Admin / Owner</strong>,{' '}
          <strong>Production Manager</strong>, <strong>Store Manager</strong>,{' '}
          <strong>Quality Inspector</strong>, <strong>Accountant</strong>, and <strong>Buyer</strong>.
          Navigation menus, buttons, and permissions dynamically restrict visibility according to the active role.
          You can test each role at any time using the <em>Testing Role</em> selector in the top navbar.
        </p>
      </div>
    </div>
  );
}
