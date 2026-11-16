import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ToastVariant } from '../utils/toastQueue';

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; badgeBg: string; icon: React.ReactNode }
> = {
  success: {
    border: 'border-emerald-500/60 bg-slate-900/95',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  },
  info: {
    border: 'border-[#0A73C7]/70 bg-slate-900/95',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  },
  warning: {
    border: 'border-amber-500/60 bg-slate-900/95',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 z-50 flex flex-col gap-2.5 sm:w-[390px] pointer-events-none"
      aria-live="polite"
      aria-label="تنبيهات النظام"
      data-testid="toast-container"
    >
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-2xl border shadow-2xl backdrop-blur-md p-4 flex items-start gap-3 transition-all ${style.border}`}
          >
            <div className="mt-0.5">{style.icon}</div>
            <div className="flex-1 min-w-0 space-y-1 text-right">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-white leading-snug">
                  {toast.title}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="إغلاق التنبيه"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
