import type { BackendResource } from "../../../api/resourceApi";
import { AdminDataTable, type Column } from "../AdminDataTable";
import { Button } from "../../common/Button";
import { Icon } from "../../layout/Icon";

interface ResourceTableProps {
  resources: BackendResource[];
  selectedIds: number[];
  onSelectToggle: (id: number) => void;
  onSelectAllToggle: (allIds: number[]) => void;
  onPreview: (resource: BackendResource) => void;
  onEdit: (resource: BackendResource) => void;
  onApprove: (id: number) => void;
  onReject: (resource: BackendResource) => void;
  onDelete: (resource: BackendResource) => void;

  /* Pagination */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ResourceTable({
  resources,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onPreview,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: ResourceTableProps) {
  const allCurrentIds = resources.map((r) => r.id);
  const isAllSelected = allCurrentIds.length > 0 && allCurrentIds.every((id) => selectedIds.includes(id));

  const columns: Column<BackendResource>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={() => onSelectAllToggle(allCurrentIds)}
          aria-label="Select all resources"
        />
      ),
      accessor: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={(e) => {
            e.stopPropagation();
            onSelectToggle(r.id);
          }}
          aria-label={`Select ${r.title}`}
        />
      ),
    },
    {
      header: "Resource Title",
      accessor: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {r.thumbnailUrl ? (
            <img
              src={r.thumbnailUrl}
              alt={r.title}
              style={{ width: "2.25rem", height: "2.25rem", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--color-primary)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="files" size={16} />
            </div>
          )}
          <div>
            <strong style={{ color: "var(--color-ink)", display: "block" }}>{r.title}</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
              {r.author ? `By ${r.author}` : r.sourceName ? `Source: ${r.sourceName}` : "Community Contribution"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (r) => (
        <span
          style={{
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            background: "rgba(100, 116, 139, 0.12)",
            color: "var(--color-ink)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
          }}
        >
          {r.resourceType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (r) => {
        const st = r.status ?? "PUBLISHED";
        let statusClass = "completed";
        if (st === "PENDING_REVIEW") statusClass = "in-progress";
        if (st === "DRAFT" || st === "REJECTED") statusClass = "pending";

        return <span className={`status-pill ${statusClass}`}>{st.replace(/_/g, " ")}</span>;
      },
    },
    {
      header: "Actions",
      accessor: (r) => (
        <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          <Button
            variant="ghost"
            onClick={() => onPreview(r)}
            style={{ padding: "0.2rem 0.45rem", minHeight: "1.8rem", fontSize: "var(--text-xs)" }}
            title="Preview resource details"
          >
            <Icon name="play" size={14} />
          </Button>

          <Button
            variant="ghost"
            onClick={() => onEdit(r)}
            style={{ padding: "0.2rem 0.45rem", minHeight: "1.8rem", fontSize: "var(--text-xs)" }}
            title="Edit resource"
          >
            <Icon name="pencil" size={14} />
          </Button>

          {r.status === "PENDING_REVIEW" && (
            <>
              <Button
                variant="primary"
                onClick={() => onApprove(r.id)}
                style={{ padding: "0.2rem 0.5rem", minHeight: "1.8rem", fontSize: "var(--text-xs)" }}
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                onClick={() => onReject(r)}
                style={{
                  padding: "0.2rem 0.5rem",
                  minHeight: "1.8rem",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-danger)",
                }}
              >
                Reject
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            onClick={() => onDelete(r)}
            style={{
              padding: "0.2rem 0.45rem",
              minHeight: "1.8rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-danger)",
            }}
            title="Delete resource"
          >
            <Icon name="trash" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminDataTable columns={columns} data={resources} emptyMessage="No resources found matching the specified criteria." />

      {/* Pagination Controls UI */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1.25rem",
            padding: "0.75rem 1rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-line)",
          }}
        >
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
            Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
          </span>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant="ghost"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              style={{ padding: "0.25rem 0.6rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              style={{ padding: "0.25rem 0.6rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
