import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: number; type: ToastType; message: string; }
interface ToastContextType { toasts: Toast[]; addToast: (type: ToastType, message: string) => void; removeToast: (id: number) => void; }

const ToastContext = createContext<ToastContextType>({ toasts: [], addToast: () => {}, removeToast: () => {} });
export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  const icons: Record<ToastType, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors: Record<ToastType, string> = { success: 'border-hive-500 bg-hive-500/10', error: 'border-red-500 bg-red-500/10', info: 'border-blue-500 bg-blue-500/10', warning: 'border-yellow-500 bg-yellow-500/10' };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-2 p-3 rounded-xl border ${colors[toast.type]}`}>
            <span>{icons[toast.type]}</span>
            <p className="text-white text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-[var(--text-muted)] hover:text-white">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
