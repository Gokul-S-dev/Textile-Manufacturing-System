import React from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useNotificationStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-xl border transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isError
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : isWarning
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-white border-gray-200 text-gray-900 shadow-md'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {isError && <XCircle className="h-5 w-5 text-rose-600" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-blue-600" />}
            </div>

            <div className="flex-1">
              {toast.title && <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>}
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-700 hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
