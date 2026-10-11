import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => toast(message, 'success'), [toast]);
  const showError = useCallback((message: string) => toast(message, 'error'), [toast]);
  const showInfo = useCallback((message: string) => toast(message, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[9999] pointer-events-none flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl border text-sm font-semibold"
              style={{
                backgroundColor:
                  t.type === 'success'
                    ? 'rgba(6, 78, 59, 0.95)'
                    : t.type === 'error'
                    ? 'rgba(159, 18, 57, 0.95)'
                    : 'rgba(15, 23, 42, 0.95)',
                borderColor:
                  t.type === 'success'
                    ? 'rgba(52, 211, 153, 0.3)'
                    : t.type === 'error'
                    ? 'rgba(251, 113, 133, 0.3)'
                    : 'rgba(148, 163, 184, 0.3)',
                color: '#ffffff',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
                <p className="leading-snug text-xs sm:text-sm font-medium break-words">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (msg: string) => console.log('Toast:', msg),
      showSuccess: (msg: string) => console.log('Toast Success:', msg),
      showError: (msg: string) => console.warn('Toast Error:', msg),
      showInfo: (msg: string) => console.info('Toast Info:', msg),
    };
  }
  return context;
}
