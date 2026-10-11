import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  Server,
  RefreshCw,
  ExternalLink,
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
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#00bcd4] animate-ping" />
            <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#00acc1]">
              System Config
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
            API & Server Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure backend API connection target, test server reachability, and inspect Swagger API documentation.
          </p>
        </div>
      </div>

      {/* Backend Target Card */}
      <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-[#00bcd4]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Backend API Connection</h3>
              <p className="text-xs text-slate-400">Live Express REST API server target</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isServerOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span
              className={`text-xs font-bold ${
                isServerOnline ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isServerOnline ? `Online (${serverLatency || 20}ms latency)` : 'Demo Fallback Active'}
            </span>
          </div>
        </div>

        {/* URL Form */}
        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">API Base URL</label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://172.17.40.17:5000/api"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-[#00bcd4] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPinging}
                className="rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test & Save</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-black uppercase text-slate-400">Quick Presets:</span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('http://172.17.40.17:5000/api')}
                className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100"
              >
                172.17.40.17:5000 (LAN Address)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('http://localhost:5000/api')}
                className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100"
              >
                localhost:5000 (Local Dev)
              </button>
            </div>
          </div>
        </form>

        {/* Swagger Documentation Link */}
        <div className="rounded-2xl bg-cyan-50/70 border border-cyan-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Interactive Swagger Documentation</h4>
            <p className="text-[11px] text-[#00acc1] font-mono mt-0.5 font-bold">
              {docsUrl}
            </p>
          </div>

          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#00bcd4] hover:bg-[#00acc1] px-4 py-2 text-xs font-extrabold text-white shrink-0 shadow-xs"
          >
            <span>Open Swagger Docs</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}


