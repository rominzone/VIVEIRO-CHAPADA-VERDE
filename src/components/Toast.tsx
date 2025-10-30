import { createContext, useContext, useMemo, useState } from 'react';

export type ToastIntent = 'success' | 'info' | 'error';

interface ToastItem {
  id: string;
  message: string;
  intent: ToastIntent;
}

interface ToastContextValue {
  pushToast: (message: string, intent?: ToastIntent) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const colors: Record<ToastIntent, string> = {
  success: 'bg-emerald-600',
  info: 'bg-slate-700',
  error: 'bg-rose-600'
};

let incremental = 0;

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (message: string, intent: ToastIntent = 'info') => {
    incremental += 1;
    const id = `${Date.now()}-${incremental}`;
    setToasts((current) => [...current, { id, message, intent }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  };

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 flex flex-col items-center gap-2 px-4" aria-live="assertive">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-sm rounded-lg ${colors[toast.intent]} px-4 py-3 text-sm text-white shadow-lg`}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}
