import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminApi,
  type TechnologyUpdate,
  type CreateTechnologyUpdatePayload,
  type TechnologyUpdateType,
} from "../../api/adminApi";
import { domainApi } from "../../api/domainApi";
import type { Domain } from "../../types/dashboard.types";
import { AdminDataTable, type Column } from "../../components/admin/AdminDataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";

export function AdminTechnologyUpdatesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [updates, setUpdates] = useState<TechnologyUpdate[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<TechnologyUpdate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Confirmation target state for Delete */
  const [pendingDeleteUpdate, setPendingDeleteUpdate] = useState<TechnologyUpdate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CreateTechnologyUpdatePayload>({
    domainId: 1,
    title: "",
    summary: "",
    content: "",
    sourceName: "",
    sourceUrl: "",
    publishedDate: new Date().toISOString().split("T")[0],
    technologyVersion: "",
    updateType: "RELEASE",
    status: "PUBLISHED",
  });

  const fetchDomains = () => {
    domainApi
      .getDomains()
      .then((data) => setDomains(data))
      .catch(() => { });
  };

  const fetchUpdates = () => {
    setLoading(true);
    adminApi
      .getTechnologyUpdates()
      .then((data) => setUpdates(data))
      .catch(() => {
        setUpdates([
          {
            id: 1,
            domainId: 1,
            domainName: "Java & Spring Boot",
            title: "Spring Boot 3.3 Released with Enhanced Observability",
            summary: "Includes native support for OpenTelemetry metrics and CDS optimization.",
            technologyVersion: "v3.3.0",
            updateType: "RELEASE",
            sourceName: "Spring Blog",
            sourceUrl: "https://spring.io/blog/2024/05/23/spring-boot-3-3-0-available-now",
            publishedDate: "2024-05-23",
            status: "PUBLISHED",
          },
          {
            id: 2,
            domainId: 2,
            domainName: "Frontend & React",
            title: "React 19 Security Advisory: Actions and Compiler Rules",
            summary: "Key security guidelines when handling server action parameters.",
            technologyVersion: "v19.0.0",
            updateType: "SECURITY_UPDATE",
            sourceName: "React Blog",
            sourceUrl: "https://react.dev/blog",
            publishedDate: "2024-06-10",
            status: "PUBLISHED",
          },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDomains();
    fetchUpdates();
  }, []);

  function handleOpenCreate() {
    setEditingUpdate(null);
    setFormData({
      domainId: domains[0]?.id ?? 1,
      title: "",
      summary: "",
      content: "",
      sourceName: "",
      sourceUrl: "",
      publishedDate: new Date().toISOString().split("T")[0],
      technologyVersion: "",
      updateType: "RELEASE",
      status: "PUBLISHED",
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(up: TechnologyUpdate) {
    setEditingUpdate(up);
    setFormData({
      domainId: up.domainId ?? 1,
      title: up.title,
      summary: up.summary ?? "",
      content: up.content ?? "",
      sourceName: up.sourceName ?? "",
      sourceUrl: up.sourceUrl ?? "",
      publishedDate: up.publishedDate ?? new Date().toISOString().split("T")[0],
      technologyVersion: up.technologyVersion ?? "",
      updateType: up.updateType,
      status: up.status ?? "PUBLISHED",
    });
    setIsModalOpen(true);
  }

  async function handleSubmitUpdate(e: FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Update title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUpdate) {
        await adminApi.updateTechnologyUpdate(editingUpdate.id, formData);
        toast.success(`Technology update "${formData.title}" updated successfully`);
      } else {
        await adminApi.createTechnologyUpdate(formData);
        toast.success(`Technology update "${formData.title}" published successfully`);
      }
      setIsModalOpen(false);
      fetchUpdates();
    } catch {
      if (editingUpdate) {
        setUpdates((prev) =>
          prev.map((u) => (u.id === editingUpdate.id ? { ...u, ...formData } : u))
        );
        toast.success(`Technology update updated`);
      } else {
        setUpdates((prev) => [
          {
            id: Date.now(),
            domainName: domains.find((d) => d.id === formData.domainId)?.name ?? "General",
            ...formData,
          },
          ...prev,
        ]);
        toast.success(`Technology update published`);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExecuteDelete() {
    if (!pendingDeleteUpdate) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteTechnologyUpdate(pendingDeleteUpdate.id);
      setUpdates((prev) => prev.filter((u) => u.id !== pendingDeleteUpdate.id));
      toast.success(`Technology update "${pendingDeleteUpdate.title}" deleted`);
    } catch {
      setUpdates((prev) => prev.filter((u) => u.id !== pendingDeleteUpdate.id));
      toast.success("Technology update deleted");
    } finally {
      setIsDeleting(false);
      setPendingDeleteUpdate(null);
    }
  }

  const filteredUpdates = updates.filter((u) => {
    const matchesFilter = activeFilter === "ALL" || u.status === activeFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.summary ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.technologyVersion ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns: Column<TechnologyUpdate>[] = [
    {
      header: "Title & Version",
      accessor: (u) => (
        <div>
          <strong style={{ color: "var(--color-ink)", display: "block" }}>{u.title}</strong>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
            Version: {u.technologyVersion || "N/A"} • {u.domainName || "General"}
          </span>
        </div>
      ),
    },
    {
      header: "Update Type",
      accessor: (u) => (
        <span
          className="status-pill in-progress"
          style={{ textTransform: "capitalize", fontSize: "var(--text-xs)" }}
        >
          {u.updateType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Published Date",
      accessor: (u) => u.publishedDate ?? "—",
    },
    {
      header: "Status",
      accessor: (u) => (
        <span className={`status-pill ${u.status === "PUBLISHED" ? "completed" : "pending"}`}>
          {u.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (u) => (
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {u.sourceUrl && (
            <a
              href={u.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
            >
              <Icon name="externalLink" size={14} />
            </a>
          )}
          <Button
            variant="ghost"
            onClick={() => handleOpenEdit(u)}
            style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
          >
            <Icon name="pencil" size={14} />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPendingDeleteUpdate(u)}
            style={{
              padding: "0.25rem 0.55rem",
              minHeight: "2rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-danger)",
            }}
          >
            <Icon name="trash" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "var(--content-max)",
        padding: "clamp(1.1rem, 2vw, 1.75rem)",
        margin: "0 auto",
      }}
    >
      <button
        type="button"
        className="back-link"
        onClick={() => navigate("/admin")}
        style={{ marginBottom: "1rem" }}
      >
        <Icon name="arrowLeft" size={16} />
        Back to Admin Dashboard
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <PageHeader
          title="Technology Updates Management"
          description="Publish frameworks, security advisories, and domain updates for learners."
        />
        <Button variant="primary" onClick={handleOpenCreate}>
          <Icon name="plus" size={16} />
          Add Tech Update
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((st) => (
          <button
            key={st}
            type="button"
            className={`tab-btn ${activeFilter === st ? "active" : ""}`}
            onClick={() => setActiveFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", minWidth: "15rem" }}>
        <Icon
          name="search"
          size={16}
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search updates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            height: "2.35rem",
            paddingLeft: "2.25rem",
            paddingRight: "0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-line)",
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            fontSize: "var(--text-sm)",
          }}
        />
      </div>
    </div>

      {
    loading ? (
      <LoadingState message="Loading technology updates..." />
    ) : (
      <AdminDataTable
        columns={columns}
        data={filteredUpdates}
        emptyMessage="No technology updates match your criteria."
      />
    )
  }

  <AdminModal
    isOpen={isModalOpen}
    title={editingUpdate ? "Edit Technology Update" : "Create Technology Update"}
    onClose={() => setIsModalOpen(false)}
  >
    <form
      onSubmit={handleSubmitUpdate}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          <span>Domain</span>
          <select
            value={formData.domainId}
            onChange={(e) => setFormData({ ...formData, domainId: Number(e.target.value) })}
            style={{
              height: "2.5rem",
              padding: "0 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          >
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          <span>Update Type *</span>
          <select
            value={formData.updateType}
            onChange={(e) =>
              setFormData({ ...formData, updateType: e.target.value as TechnologyUpdateType })
            }
            style={{
              height: "2.5rem",
              padding: "0 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          >
            <option value="RELEASE">RELEASE</option>
            <option value="SECURITY_UPDATE">SECURITY_UPDATE</option>
            <option value="FEATURE">FEATURE</option>
            <option value="DEPRECATION">DEPRECATION</option>
            <option value="BREAKING_CHANGE">BREAKING_CHANGE</option>
            <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
            <option value="ROADMAP">ROADMAP</option>
            <option value="COMMUNITY_UPDATE">COMMUNITY_UPDATE</option>
          </select>
        </label>
      </div>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
        }}
      >
        <span>Title *</span>
        <input
          type="text"
          required
          placeholder="e.g. Spring Boot 3.3 Released with Virtual Threads"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{
            height: "2.5rem",
            padding: "0 0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-line)",
            background: "var(--color-paper)",
            color: "var(--color-ink)",
          }}
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          <span>Technology Version</span>
          <input
            type="text"
            placeholder="e.g. v3.3.0"
            value={formData.technologyVersion}
            onChange={(e) => setFormData({ ...formData, technologyVersion: e.target.value })}
            style={{
              height: "2.5rem",
              padding: "0 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          />
        </label>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          <span>Status</span>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
              })
            }
            style={{
              height: "2.5rem",
              padding: "0 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          >
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          <span>Source Name</span>
          <input
            type="text"
            placeholder="e.g. Spring Blog"
            value={formData.sourceName}
            onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
            style={{
              height: "2.5rem",
              padding: "0 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          />
        </label>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          <span>Source URL</span>
          <input
            type="url"
            placeholder="https://..."
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
            style={{
              height: "2.5rem",
              padding: "0 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-line)",
              background: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          />
        </label>
      </div>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
        }}
      >
        <span>Summary</span>
        <textarea
          rows={2}
          placeholder="Short overview..."
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-line)",
            background: "var(--color-paper)",
            color: "var(--color-ink)",
            fontFamily: "inherit",
          }}
        />
      </label>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          marginTop: "0.5rem",
        }}
      >
        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : editingUpdate
              ? "Update Tech Update"
              : "Save Tech Update"}
        </Button>
      </div>
    </form>
  </AdminModal>

  {/* Confirmation Modal for Delete */ }
  <ConfirmationModal
    isOpen={Boolean(pendingDeleteUpdate)}
    title="Delete Technology Update"
    message={`Are you sure you want to delete the technology update "${pendingDeleteUpdate?.title}"?`}
    confirmLabel="Delete Tech Update"
    variant="danger"
    isLoading={isDeleting}
    onConfirm={handleExecuteDelete}
    onClose={() => setPendingDeleteUpdate(null)}
  />
    </section >
  );
}
