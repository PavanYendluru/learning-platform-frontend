import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { ToastContainer, type ToastMessage, type ToastType } from "../components/common/ToastContainer";

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", durationMs = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastMessage = { id, message, type, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, durationMs?: number) => showToast(message, "success", durationMs),
    [showToast]
  );

  const error = useCallback(
    (message: string, durationMs?: number) => showToast(message, "error", durationMs),
    [showToast]
  );

  const info = useCallback(
    (message: string, durationMs?: number) => showToast(message, "info", durationMs),
    [showToast]
  );

  const warning = useCallback(
    (message: string, durationMs?: number) => showToast(message, "warning", durationMs),
    [showToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success,
      error,
      info,
      warning,
      removeToast,
    }),
    [showToast, success, error, info, warning, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}
