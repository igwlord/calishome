import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check size={18} strokeWidth={3} />,
  error: <X size={18} strokeWidth={3} />,
  warning: <AlertTriangle size={18} strokeWidth={2.5} />,
  info: <Info size={18} strokeWidth={2.5} />,
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: 'bg-emerald-950/90', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: 'text-emerald-400' },
  error:   { bg: 'bg-red-950/90',     border: 'border-red-500/40',     text: 'text-red-300',     icon: 'text-red-400' },
  warning: { bg: 'bg-amber-950/90',   border: 'border-amber-500/40',   text: 'text-amber-300',   icon: 'text-amber-400' },
  info:    { bg: 'bg-sky-950/90',      border: 'border-sky-500/40',     text: 'text-sky-300',     icon: 'text-sky-400' },
};

const ToastItem: React.FC<{ toast: ToastItem; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const c = COLORS[toast.type];
  const isConfirm = !!toast.onConfirm;

  useEffect(() => {
    if (isConfirm) return; // confirmations don't auto-dismiss
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove, isConfirm]);

  const handleConfirm = () => {
    toast.onConfirm?.();
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const handleCancel = () => {
    toast.onCancel?.();
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`w-full px-4 py-2.5 border-b backdrop-blur-md shadow-lg flex flex-col gap-2 transition-all duration-300 pointer-events-auto ${c.bg} ${c.border} ${exiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <div className="flex items-center justify-center gap-3 max-w-md mx-auto w-full">
        <div className={`shrink-0 ${c.icon}`}>{ICONS[toast.type]}</div>
        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest truncate flex-1 ${c.text}`}>{toast.message}</span>
        {!isConfirm && (
          <button onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }} className="text-zinc-500 hover:text-white p-1">
            <X size={14} />
          </button>
        )}
      </div>
      {isConfirm && (
        <div className="flex justify-center gap-2 mt-1 max-w-md mx-auto w-full">
          <button onClick={handleConfirm} className={`flex-1 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform ${c.bg} border ${c.border} ${c.text}`}>
            {toast.confirmText || 'Confirmar'}
          </button>
          <button onClick={handleCancel} className="flex-1 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest bg-zinc-800/80 text-zinc-400 border border-zinc-700 active:scale-95 transition-transform">
            {toast.cancelText || 'Cancelar'}
          </button>
        </div>
      )}
    </div>
  );
};

// Context
const ToastContext = React.createContext<{
  show: (message: string, type?: ToastType, duration?: number) => void;
  confirm: (message: string, onConfirm: () => void, opts?: { type?: ToastType; confirmText?: string; cancelText?: string }) => void;
}>({ show: () => {}, confirm: () => {} });

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    setToasts(prev => [...prev, { id: nextId++, message, type, duration }]);
  }, []);

  const confirm = useCallback((message: string, onConfirm: () => void, opts?: { type?: ToastType; confirmText?: string; cancelText?: string }) => {
    setToasts(prev => [...prev, {
      id: nextId++,
      message,
      type: opts?.type || 'warning',
      onConfirm,
      onCancel: () => {},
      confirmText: opts?.confirmText,
      cancelText: opts?.cancelText,
    }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show, confirm }}>
      {children}
      {/* Toast container (Unified Top Banner System) */}
      <div className="fixed top-0 left-0 right-0 z-[160] flex flex-col pointer-events-none pt-safe-top">
        {toasts.map(t => (
          <div key={t.id} className="animate-in slide-in-from-top-full duration-300 w-full pointer-events-none">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => React.useContext(ToastContext);
