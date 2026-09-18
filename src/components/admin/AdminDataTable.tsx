import type { ReactNode } from "react";

export interface Column<T> {
  header: ReactNode;
  accessor: (item: T) => ReactNode;
}

export function AdminDataTable<T extends { id: number | string }>({
  columns,
  data,
  emptyMessage = "No records found.",
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--color-line)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
        <thead>
          <tr style={{ background: "var(--color-paper)", borderBottom: "1px solid var(--color-line)" }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "var(--color-muted)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                style={{
                  borderBottom: "1px solid var(--color-line)",
                  cursor: onRowClick ? "pointer" : "default",
                }}
              >
                {columns.map((col, idx) => (
                  <td key={idx} style={{ padding: "0.85rem 1rem", color: "var(--color-ink)", verticalAlign: "middle" }}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted)" }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
