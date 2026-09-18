import { Button } from "../../common/Button";
import { Icon } from "../../layout/Icon";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onBulkApprove,
  onBulkDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        marginBottom: "1rem",
        borderRadius: "var(--radius-md)",
        background: "rgba(99, 102, 241, 0.1)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Icon name="check" size={18} className="text-primary" />
        <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-primary)" }}>
          {selectedCount} resource{selectedCount > 1 ? "s" : ""} selected
        </strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Button
          variant="primary"
          onClick={onBulkApprove}
          style={{ padding: "0.3rem 0.75rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
        >
          <Icon name="check" size={14} />
          Approve Selected
        </Button>
        <Button
          variant="ghost"
          onClick={onBulkDelete}
          style={{
            padding: "0.3rem 0.75rem",
            minHeight: "2rem",
            fontSize: "var(--text-xs)",
            color: "var(--color-danger)",
          }}
        >
          <Icon name="trash" size={14} />
          Delete Selected
        </Button>
        <Button
          variant="ghost"
          onClick={onClearSelection}
          style={{ padding: "0.3rem 0.6rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
