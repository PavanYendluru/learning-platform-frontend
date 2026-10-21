import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, type CreateDomainPayload } from "../../api/adminApi";
import type { Domain } from "../../types/dashboard.types";
import { AdminDataTable, type Column } from "../../components/admin/AdminDataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";

export function AdminDomainsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Confirmation target state for Delete */
  const [pendingDeleteDomain, setPendingDeleteDomain] = useState<Domain | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CreateDomainPayload>({
    name: "",
    description: "",
    difficulty: "BEGINNER",
    status: "ACTIVE",
    bannerUrl: "",
    iconUrl: "",
  });

  const fetchDomains = () => {
    setLoading(true);
    adminApi
      .getAdminDomains()
      .then((data) => setDomains(data ?? []))
      .catch((err: any) => {
        setDomains([]);
        toast.error(err?.message || "Failed to load domains");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  function handleOpenCreate() {
    setEditingDomain(null);
    setFormData({ name: "", description: "", difficulty: "BEGINNER", status: "ACTIVE", bannerUrl: "", iconUrl: "" });
    setIsModalOpen(true);
  }

  function handleOpenEdit(domain: Domain) {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      description: domain.description,
      difficulty: domain.difficulty ?? "BEGINNER",
      status: domain.status ?? "ACTIVE",
      bannerUrl: domain.bannerUrl ?? "",
      iconUrl: domain.iconUrl ?? "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmitDomain(e: FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields (Name & Description).");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDomain) {
        await adminApi.updateDomain(editingDomain.id, formData);
        toast.success(`Domain "${formData.name}" updated successfully`);
      } else {
        await adminApi.createDomain(formData);
        toast.success(`Domain "${formData.name}" created successfully`);
      }
      setIsModalOpen(false);
      fetchDomains();
    } catch (err: any) {
      toast.error(err?.message || (editingDomain ? "Failed to update domain" : "Failed to create domain"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(domain: Domain) {
    const nextStatus = domain.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminApi.updateDomain(domain.id, {
        name: domain.name,
        description: domain.description,
        difficulty: domain.difficulty,
        status: nextStatus,
      });
      setDomains((prev) => prev.map((d) => (d.id === domain.id ? { ...d, status: nextStatus } : d)));
      toast.info(`Domain "${domain.name}" is now ${nextStatus}`);
    } catch {
      setDomains((prev) => prev.map((d) => (d.id === domain.id ? { ...d, status: nextStatus } : d)));
      toast.info(`Domain status updated to ${nextStatus}`);
    }
  }

  async function handleExecuteDelete() {
    if (!pendingDeleteDomain) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteDomain(pendingDeleteDomain.id);
      setDomains((prev) => prev.filter((d) => d.id !== pendingDeleteDomain.id));
      toast.success(`Domain "${pendingDeleteDomain.name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete domain");
    } finally {
      setIsDeleting(false);
      setPendingDeleteDomain(null);
    }
  }

  const filteredDomains = domains.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.difficulty ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Domain>[] = [
    {
      header: "Domain Name",
      accessor: (d) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {d.iconUrl ? (
            <img
              src={d.iconUrl}
              alt={d.name}
              style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(37, 99, 235, 0.15)",
                color: "var(--color-primary)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="compass" size={16} />
            </div>
          )}
          <div>
            <strong style={{ color: "var(--color-ink)", display: "block" }}>{d.name}</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>/{d.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (d) => (
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: "20rem" }}>
          {d.description}
        </span>
      ),
    },
    {
      header: "Difficulty",
      accessor: (d) => <span className="status-pill in-progress">{d.difficulty ?? "BEGINNER"}</span>,
    },
    {
      header: "Status",
      accessor: (d) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(d)}
          className={`status-pill ${d.status === "ACTIVE" || !d.status ? "completed" : "pending"}`}
          style={{ border: "none", cursor: "pointer" }}
        >
          {d.status ?? "ACTIVE"}
        </button>
      ),
    },
    {
      header: "Actions",
      accessor: (d) => (
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <Button variant="ghost" onClick={() => navigate(`/admin/topics?domainId=${d.id}`)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)", gap: "0.3rem" }}>
            <Icon name="fileText" size={14} />
            Topics
          </Button>
          <Button variant="ghost" onClick={() => handleOpenEdit(d)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}>
            <Icon name="pencil" size={14} />
          </Button>
          <Button variant="ghost" onClick={() => setPendingDeleteDomain(d)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
            <Icon name="trash" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section style={{ width: "100%", maxWidth: "var(--content-max)", padding: "clamp(1.1rem, 2vw, 1.75rem)", margin: "0 auto" }}>
      <button type="button" className="back-link" onClick={() => navigate("/admin")} style={{ marginBottom: "1rem" }}>
        <Icon name="arrowLeft" size={16} />
        Back to Admin Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <PageHeader title="Domain Management" description="Create, configure, edit, and manage active learning domains." />
        <Button variant="primary" onClick={handleOpenCreate}>
          <Icon name="plus" size={16} />
          Create New Domain
        </Button>
      </div>

      <div style={{ marginBottom: "1.25rem", position: "relative", maxWidth: "20rem" }}>
        <Icon name="search" size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
        <input
          type="text"
          placeholder="Search domains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", height: "2.35rem", paddingLeft: "2.25rem", paddingRight: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: "var(--text-sm)" }}
        />
      </div>

      {loading ? (
        <LoadingState message="Loading domains..." />
      ) : (
        <AdminDataTable columns={columns} data={filteredDomains} emptyMessage="No domains found matching your search." />
      )}

      {/* Reusable AdminModal for Creation and Editing */}
      <AdminModal isOpen={isModalOpen} title={editingDomain ? "Edit Domain" : "Create Learning Domain"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmitDomain} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Domain Name *</span>
            <input
              type="text"
              required
              placeholder="e.g. Cloud & DevOps Architecture"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Description *</span>
            <textarea
              required
              rows={3}
              placeholder="Brief overview of the domain..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)", fontFamily: "inherit" }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              <span>Difficulty Level</span>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              <span>Status</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Icon URL (Optional)</span>
            <input
              type="url"
              placeholder="https://example.com/icon.png or /images/icon.png"
              value={formData.iconUrl ?? ""}
              onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
            {formData.iconUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>Preview:</span>
                <img src={formData.iconUrl} alt="Icon Preview" style={{ width: "1.5rem", height: "1.5rem", objectFit: "cover", borderRadius: "4px" }} />
              </div>
            )}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Banner URL (Optional)</span>
            <input
              type="url"
              placeholder="https://example.com/banner.png or /images/banner.png"
              value={formData.bannerUrl ?? ""}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
            {formData.bannerUrl && (
              <div style={{ marginTop: "0.25rem" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", display: "block", marginBottom: "0.2rem" }}>Preview:</span>
                <img src={formData.bannerUrl} alt="Banner Preview" style={{ width: "100%", maxHeight: "4rem", objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
              </div>
            )}
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingDomain ? "Update Domain" : "Save Domain"}
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={Boolean(pendingDeleteDomain)}
        title="Delete Domain"
        message={`Are you sure you want to delete the domain "${pendingDeleteDomain?.name}"? All associated topics and resources may be affected.`}
        confirmLabel="Delete Domain"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDelete}
        onClose={() => setPendingDeleteDomain(null)}
      />
    </section>
  );
}
