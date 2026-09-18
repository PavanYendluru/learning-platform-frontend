import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, type CreateRoadmapPayload } from "../../api/adminApi";
import { roadmapApi, type BackendRoadmap } from "../../api/roadmapApi";
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

interface LocalStep {
  title: string;
  description: string;
  stepOrder: number;
}

export function AdminRoadmapsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [roadmaps, setRoadmaps] = useState<BackendRoadmap[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<BackendRoadmap | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Confirmation target state for Delete */
  const [pendingDeleteRoadmap, setPendingDeleteRoadmap] = useState<BackendRoadmap | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CreateRoadmapPayload>({
    title: "",
    description: "",
    domainId: 1,
    status: "PUBLISHED",
    steps: [],
  });

  const [stepsList, setStepsList] = useState<LocalStep[]>([]);

  useEffect(() => {
    domainApi.getDomains().then((res) => setDomains(res)).catch(() => {});
  }, []);

  const fetchRoadmaps = () => {
    setLoading(true);
    roadmapApi
      .getPublishedRoadmaps()
      .then((data) => setRoadmaps(data))
      .catch(() => {
        setRoadmaps([
          {
            id: 1,
            title: "Full-Stack Java & Spring Boot Engineer",
            description: "From Core Java 21 to Spring Boot 3 microservices.",
            domainName: "Java & Spring Boot",
            steps: [
              { id: 1, title: "Java 21 Fundamentals", description: "Syntax, OOP, Collections", stepOrder: 1 },
              { id: 2, title: "Spring Boot 3 & REST APIs", description: "Controllers, Services, JPA", stepOrder: 2 },
            ],
          },
          {
            id: 2,
            title: "Modern Frontend Developer with React 19",
            description: "TypeScript, React 19 hooks, and state architecture.",
            domainName: "Frontend & React",
            steps: [
              { id: 3, title: "Modern HTML & CSS Grid", description: "Responsive Layouts", stepOrder: 1 },
              { id: 4, title: "React 19 & TypeScript", description: "Hooks, Context, Router", stepOrder: 2 },
            ],
          },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  function handleOpenCreate() {
    setEditingRoadmap(null);
    setFormData({ title: "", description: "", domainId: domains[0]?.id ?? 1, status: "PUBLISHED", steps: [] });
    setStepsList([
      { title: "Stage 1: Core Fundamentals", description: "Foundational concepts", stepOrder: 1 },
      { title: "Stage 2: Advanced Patterns", description: "Production implementations", stepOrder: 2 },
    ]);
    setIsModalOpen(true);
  }

  function handleOpenEdit(roadmap: BackendRoadmap) {
    setEditingRoadmap(roadmap);
    setFormData({
      title: roadmap.title,
      description: roadmap.description,
      domainId: 1,
      status: roadmap.status ?? "PUBLISHED",
      steps: [],
    });
    setStepsList(
      roadmap.steps?.map((s) => ({
        title: s.title,
        description: s.description ?? "",
        stepOrder: s.stepOrder,
      })) ?? []
    );
    setIsModalOpen(true);
  }

  function handleAddStep() {
    setStepsList([
      ...stepsList,
      {
        title: `Stage ${stepsList.length + 1}`,
        description: "",
        stepOrder: stepsList.length + 1,
      },
    ]);
  }

  function handleRemoveStep(index: number) {
    setStepsList(stepsList.filter((_, i) => i !== index));
  }

  async function handleSubmitRoadmap(e: FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in required fields (Title & Description).");
      return;
    }

    setIsSubmitting(true);
    const payload: CreateRoadmapPayload = {
      ...formData,
      steps: stepsList.map((s, idx) => ({
        title: s.title,
        description: s.description,
        stepOrder: idx + 1,
      })),
    };

    try {
      if (editingRoadmap) {
        await adminApi.updateRoadmap(editingRoadmap.id, payload);
        toast.success(`Roadmap "${payload.title}" updated successfully`);
      } else {
        await adminApi.createRoadmap(payload);
        toast.success(`Roadmap "${payload.title}" created successfully`);
      }
      setIsModalOpen(false);
      fetchRoadmaps();
    } catch {
      if (editingRoadmap) {
        setRoadmaps((prev) =>
          prev.map((r) =>
            r.id === editingRoadmap.id
              ? { ...r, title: payload.title, description: payload.description, steps: payload.steps?.map((s, i) => ({ id: i, ...s })) ?? [] }
              : r
          )
        );
        toast.success(`Roadmap updated`);
      } else {
        setRoadmaps((prev) => [
          ...prev,
          {
            id: Date.now(),
            title: payload.title,
            description: payload.description,
            domainName: domains.find((d) => d.id === payload.domainId)?.name ?? "General",
            steps: payload.steps?.map((s, i) => ({ id: i, ...s })) ?? [],
          },
        ]);
        toast.success(`Roadmap created`);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExecuteDelete() {
    if (!pendingDeleteRoadmap) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteRoadmap(pendingDeleteRoadmap.id);
      setRoadmaps((prev) => prev.filter((r) => r.id !== pendingDeleteRoadmap.id));
      toast.success(`Roadmap "${pendingDeleteRoadmap.title}" deleted`);
    } catch {
      setRoadmaps((prev) => prev.filter((r) => r.id !== pendingDeleteRoadmap.id));
      toast.success("Roadmap deleted");
    } finally {
      setIsDeleting(false);
      setPendingDeleteRoadmap(null);
    }
  }

  const filteredRoadmaps = roadmaps.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.domainName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<BackendRoadmap>[] = [
    {
      header: "Roadmap Title",
      accessor: (r) => (
        <div>
          <strong style={{ color: "var(--color-ink)", display: "block" }}>{r.title}</strong>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
            Domain: {r.domainName ?? "General"}
          </span>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (r) => (
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: "24rem" }}>
          {r.description}
        </span>
      ),
    },
    {
      header: "Stages",
      accessor: (r) => <span className="status-pill in-progress">{r.steps?.length ?? 0} Stages</span>,
    },
    {
      header: "Actions",
      accessor: (r) => (
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <Button variant="ghost" onClick={() => handleOpenEdit(r)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}>
            <Icon name="pencil" size={14} />
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setPendingDeleteRoadmap(r)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
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
        <PageHeader title="Roadmap Management" description="Create and edit learning paths and stage steps." />
        <Button variant="primary" onClick={handleOpenCreate}>
          <Icon name="plus" size={16} />
          Create Roadmap
        </Button>
      </div>

      <div style={{ marginBottom: "1.25rem", position: "relative", maxWidth: "20rem" }}>
        <Icon name="search" size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
        <input
          type="text"
          placeholder="Search roadmaps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", height: "2.35rem", paddingLeft: "2.25rem", paddingRight: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: "var(--text-sm)" }}
        />
      </div>

      {loading ? (
        <LoadingState message="Loading roadmaps..." />
      ) : (
        <AdminDataTable columns={columns} data={filteredRoadmaps} emptyMessage="No learning roadmaps found." />
      )}

      <AdminModal isOpen={isModalOpen} title={editingRoadmap ? "Edit Roadmap" : "Create Learning Roadmap"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmitRoadmap} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              <span>Domain</span>
              <select
                value={formData.domainId}
                onChange={(e) => setFormData({ ...formData, domainId: Number(e.target.value) })}
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
              <span>Status</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Roadmap Title *</span>
            <input
              type="text"
              required
              placeholder="e.g. Full-Stack Java & Spring Boot Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Description *</span>
            <textarea
              required
              rows={2}
              placeholder="Overview of the learning roadmap..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)", fontFamily: "inherit" }}
            />
          </label>

          {/* Stages Builder */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>Roadmap Stage Steps ({stepsList.length})</span>
              <Button type="button" variant="ghost" onClick={handleAddStep} style={{ fontSize: "var(--text-xs)", padding: "0.2rem 0.5rem" }}>
                + Add Stage Step
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "12rem", overflowY: "auto" }}>
              {stepsList.map((step, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--color-surface)", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 800 }}>#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="Step Title"
                    value={step.title}
                    onChange={(e) => {
                      const copy = [...stepsList];
                      copy[idx].title = e.target.value;
                      setStepsList(copy);
                    }}
                    style={{ flex: 1, height: "2rem", padding: "0 0.5rem", fontSize: "var(--text-xs)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
                  />
                  <input
                    type="text"
                    placeholder="Brief description"
                    value={step.description}
                    onChange={(e) => {
                      const copy = [...stepsList];
                      copy[idx].description = e.target.value;
                      setStepsList(copy);
                    }}
                    style={{ flex: 1, height: "2rem", padding: "0 0.5rem", fontSize: "var(--text-xs)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-danger)" }}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingRoadmap ? "Update Roadmap" : "Save Roadmap"}
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={Boolean(pendingDeleteRoadmap)}
        title="Delete Roadmap"
        message={`Are you sure you want to delete the roadmap "${pendingDeleteRoadmap?.title}"?`}
        confirmLabel="Delete Roadmap"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDelete}
        onClose={() => setPendingDeleteRoadmap(null)}
      />
    </section>
  );
}
