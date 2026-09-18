import { Icon } from "../layout/Icon";
import "./ToastContainer.css";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  durationMs?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => {
        let iconName: "check" | "alert" | "bell" = "bell";
        if (t.type === "success") iconName = "check";
        if (t.type === "error" || t.type === "warning") iconName = "alert";

        return (
          <div key={t.id} className={`toast-item toast-${t.type}`} role="status">
            <span className="toast-icon">
              <Icon name={iconName} size={18} />
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(t.id)}
              aria-label="Close notification"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
