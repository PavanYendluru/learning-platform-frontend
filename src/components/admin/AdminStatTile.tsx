import { Icon, type IconName } from "../layout/Icon";

export function AdminStatTile({
  value,
  label,
  iconName,
  accentColor = "var(--color-primary)",
  onClick,
}: {
  value: string | number;
  label: string;
  iconName: IconName;
  accentColor?: string;
  onClick?: () => void;
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      className="card"
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        cursor: isClickable ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        userSelect: isClickable ? "none" : "auto",
      }}
    >
      <div
        style={{
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "var(--radius-lg)",
          background: `${accentColor}18`,
          color: accentColor,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={iconName} size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ font: "800 var(--text-2xl) / 1.1 var(--font-display)", color: "var(--color-ink)", display: "block" }}>
          {value}
        </strong>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-muted)" }}>
          {label}
        </span>
      </div>
      {isClickable && (
        <Icon name="chevronRight" size={16} className="text-muted" />
      )}
    </div>
  );
}
