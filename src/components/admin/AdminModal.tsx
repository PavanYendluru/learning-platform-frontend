import type { ReactNode } from "react";
import { Icon } from "../layout/Icon";

export function AdminModal({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
        background: "rgba(11, 15, 25, 0.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "min(100%, 32rem)",
          padding: "1.5rem",
          background: "var(--color-surface)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-line)" }}>
          <h2 style={{ font: "800 var(--text-xl) / 1.2 var(--font-display)", margin: 0, color: "var(--color-ink)" }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: "transparent", color: "var(--color-muted)", padding: "0.2rem", cursor: "pointer" }}
            aria-label="Close dialog"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
