import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    let isDuplicate = false;
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) {
        isDuplicate = true;
      }
      return prev;
    });

    if (isDuplicate) return;

    if (type === 'error') {
      const lower = message.toLowerCase();
      if (
        lower.includes('failed to load') ||
        lower.includes('failed to fetch') ||
        lower.includes('not found') ||
        lower.includes('empty')
      ) {
        console.warn(`[GlowCare Toast Suppressed]: ${message}`);
        return;
      }
    }

    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <FiCheckCircle size={20} />;
      case 'error': return <FiAlertCircle size={20} />;
      case 'warning': return <FiAlertCircle size={20} />;
      default: return <FiInfo size={20} />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-mint border-mint-dark text-green-800';
      case 'error': return 'bg-red-50 border-red-300 text-red-800';
      case 'warning': return 'bg-amber-50 border-amber-300 text-amber-800';
      default: return 'bg-sky-light border-sky-dark text-sky-900';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${getColors(toast.type)}`}
              style={{ backdropFilter: 'blur(12px)' }}
            >
              <span className="flex-shrink-0">{getIcon(toast.type)}</span>
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <FiX size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
