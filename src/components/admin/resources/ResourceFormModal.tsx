import { type FormEvent } from "react";
import type { CreateResourcePayload } from "../../../api/adminApi";
import type { ResourceType } from "../../../api/resourceApi";
import type { Domain, Topic } from "../../../types/dashboard.types";
import { AdminModal } from "../AdminModal";
import { Button } from "../../common/Button";

interface ResourceFormModalProps {
  isOpen: boolean;
  editingResourceId: number | null;
  domains: Domain[];
  topics: Topic[];
  selectedDomainId: number;
  onDomainChange: (domainId: number) => void;
  formData: CreateResourcePayload;
  onFormChange: (updated: CreateResourcePayload) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

export function ResourceFormModal({
  isOpen,
  editingResourceId,
  domains,
  topics,
  selectedDomainId,
  onDomainChange,
  formData,
  onFormChange,
  isSubmitting,
  onSubmit,
  onClose,
}: ResourceFormModalProps) {
  if (!isOpen) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      title={editingResourceId ? "Edit Resource" : "Create Learning Resource"}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "75vh", overflowY: "auto", paddingRight: "0.25rem" }}>
        {/* Domain & Topic Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Domain *</span>
            <select
              value={selectedDomainId}
              onChange={(e) => onDomainChange(Number(e.target.value))}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Topic *</span>
            <select
              value={formData.topicId}
              onChange={(e) => onFormChange({ ...formData, topicId: Number(e.target.value) })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Title */}
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
          <span>Resource Title *</span>
          <input
            type="text"
            required
            placeholder="e.g. Master Spring Security 6 & OAuth2"
            value={formData.title}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </label>

        {/* External URL */}
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
          <span>External URL *</span>
          <input
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=... or https://docs..."
            value={formData.externalUrl}
            onChange={(e) => onFormChange({ ...formData, externalUrl: e.target.value })}
            style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          />
        </label>

        {/* Resource Type & Difficulty */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Resource Type</span>
            <select
              value={formData.resourceType}
              onChange={(e) => onFormChange({ ...formData, resourceType: e.target.value as ResourceType })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            >
              <option value="VIDEO">VIDEO</option>
              <option value="DOCUMENTATION">DOCUMENTATION</option>
              <option value="BOOK">BOOK</option>
              <option value="RESEARCH_PAPER">RESEARCH_PAPER</option>
              <option value="ARTICLE">ARTICLE</option>
              <option value="COURSE">COURSE</option>
              <option value="GITHUB">GITHUB</option>
              <option value="PRACTICE">PRACTICE</option>
              <option value="PROJECT">PROJECT</option>
              <option value="TECHNOLOGY_UPDATE">TECHNOLOGY_UPDATE</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Difficulty Level</span>
            <select
              value={formData.difficulty}
              onChange={(e) => onFormChange({ ...formData, difficulty: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </label>
        </div>

        {/* Author / Publisher & Duration */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Author / Instructor</span>
            <input
              type="text"
              placeholder="e.g. Dan Vega"
              value={formData.author ?? ""}
              onChange={(e) => onFormChange({ ...formData, author: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Est. Duration (Minutes)</span>
            <input
              type="number"
              min={1}
              value={formData.durationMinutes ?? 15}
              onChange={(e) => onFormChange({ ...formData, durationMinutes: Number(e.target.value) })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
          </label>
        </div>

        {/* Description */}
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
          <span>Description</span>
          <textarea
            rows={3}
            placeholder="Detailed description of what learners will gain..."
            value={formData.description ?? ""}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)", fontFamily: "inherit" }}
          />
        </label>

        {/* Status */}
        <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
          <span>Publication Status</span>
          <select
            value={formData.status ?? "PUBLISHED"}
            onChange={(e) => onFormChange({ ...formData, status: e.target.value })}
            style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
          >
            <option value="PUBLISHED">PUBLISHED (Active immediately)</option>
            <option value="PENDING_REVIEW">PENDING REVIEW</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingResourceId ? "Update Resource" : "Create Resource"}
          </Button>
        </div>
      </form>
    </AdminModal>
  );
}
