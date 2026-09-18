import { Button } from "./Button";
import { Icon } from "../layout/Icon";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const accentColor =
    variant === "danger"
      ? "var(--color-danger, #ef4444)"
      : variant === "warning"
      ? "#f59e0b"
      : "var(--color-primary, #6366f1)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 105,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
        background: "rgba(11, 15, 25, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "min(100%, 28rem)",
          padding: "1.5rem",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
          border: "1px solid var(--color-line)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "50%",
              background: `${accentColor}18`,
              color: accentColor,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon name={variant === "danger" || variant === "warning" ? "alert" : "check"} size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ font: "800 var(--text-lg) / 1.3 var(--font-display)", margin: "0 0 0.4rem", color: "var(--color-ink)" }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-muted)", lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "ghost" : "primary"}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={
              variant === "danger"
                ? {
                    background: "var(--color-danger, #ef4444)",
                    color: "#ffffff",
                    borderColor: "var(--color-danger, #ef4444)",
                  }
                : undefined
            }
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
