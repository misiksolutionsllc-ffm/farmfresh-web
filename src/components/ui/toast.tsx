'use client';

import { useAppStore } from '@/lib/app-store';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Toast() {
  const { toast, hideToast } = useAppStore();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-3.5 rounded-2xl glass border',
          borders[toast.type]
        )}
      >
        {icons[toast.type]}
        <span className="text-sm font-medium text-slate-200 max-w-xs">
          {toast.message}
        </span>
        <button
          onClick={hideToast}
          className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
