import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  ToastItem,
  ToastVariant,
  createToastItem,
  enqueueToast,
  removeToast,
} from '../utils/toastQueue';

interface ToastInput {
  title: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => removeToast(prev, id));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = 'success', durationMs = 5500 }: ToastInput) => {
      const item = createToastItem({ title, message, variant });
      setToasts((prev) => enqueueToast(prev, item));

      if (durationMs > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(item.id);
          setToasts((prev) => removeToast(prev, item.id));
        }, durationMs);
        timersRef.current.set(item.id, timer);
      }

      return item.id;
    },
    []
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
