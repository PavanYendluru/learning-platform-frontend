import type { BackendResource } from "../../../api/resourceApi";
import { AdminModal } from "../AdminModal";
import { Button } from "../../common/Button";
import { Icon } from "../../layout/Icon";

interface ResourcePreviewModalProps {
  resource: BackendResource | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResourcePreviewModal({
  resource,
  isOpen,
  onClose,
}: ResourcePreviewModalProps) {
  if (!resource || !isOpen) return null;

  const isVideo = resource.resourceType === "VIDEO";

  return (
    <AdminModal isOpen={isOpen} title={`Preview: ${resource.title}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Header Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="status-pill in-progress">{resource.resourceType.replace(/_/g, " ")}</span>
          <span className={`status-pill ${resource.status === "PUBLISHED" ? "completed" : "pending"}`}>
            {resource.status ?? "PUBLISHED"}
          </span>
          {resource.durationMinutes && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
              ⏱ {resource.durationMinutes} minutes
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-ink)", lineHeight: 1.5 }}>
          {resource.description ?? "No description provided."}
        </p>

        {/* Media / Video Frame Placeholder or Embed */}
        {isVideo && (
          <div
            style={{
              width: "100%",
              height: "12rem",
              background: "#090d16",
              borderRadius: "var(--radius-md)",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              border: "1px solid var(--color-line)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Icon name="play" size={36} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "var(--text-xs)", display: "block", marginTop: "0.5rem", color: "#94a3b8" }}>
                Video Preview Player
              </span>
            </div>
          </div>
        )}

        {/* Resource Meta Details */}
        <div
          style={{
            padding: "0.75rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-hover, rgba(0,0,0,0.03))",
            fontSize: "var(--text-xs)",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {resource.author && (
            <div>
              <strong>Author / Creator:</strong> {resource.author}
            </div>
          )}
          {resource.sourceName && (
            <div>
              <strong>Source:</strong> {resource.sourceName}
            </div>
          )}
          <div>
            <strong>URL:</strong>{" "}
            <a href={resource.externalUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", wordBreak: "break-all" }}>
              {resource.externalUrl}
            </a>
          </div>
          {resource.doi && (
            <div>
              <strong>DOI Reference:</strong> {resource.doi}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <a href={resource.externalUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="primary">
              <Icon name="externalLink" size={16} />
              Open External Link
            </Button>
          </a>
        </div>
      </div>
    </AdminModal>
  );
}
