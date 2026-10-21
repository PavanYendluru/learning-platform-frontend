import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminApi, type CreateTopicPayload } from "../../api/adminApi";
import { domainApi } from "../../api/domainApi";
import type { Domain, Topic } from "../../types/dashboard.types";
import { AdminDataTable, type Column } from "../../components/admin/AdminDataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";

export function AdminTopicsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const domainParam = searchParams.get("domainId");
  const selectedDomainId: "ALL" | number =
    domainParam === "all" || !domainParam ? "ALL" : Number(domainParam) || "ALL";

  const [domains, setDomains] = useState<Domain[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [createTopicDomainId, setCreateTopicDomainId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Confirmation target state for Delete */
  const [pendingDeleteTopic, setPendingDeleteTopic] = useState<Topic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CreateTopicPayload>({
    name: "",
    description: "",
    sequenceNumber: 1,
    difficulty: "BEGINNER",
    status: "ACTIVE",
  });

  useEffect(() => {
    domainApi
      .getDomains()
      .then((res) => {
        setDomains(res);
        if (res.length > 0) {
          setCreateTopicDomainId(res[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const currentDomain =
    selectedDomainId === "ALL"
      ? null
      : domains.find((d) => d.id === selectedDomainId) ?? null;

  const fetchTopics = (domainId: "ALL" | number) => {
    setLoading(true);
    const fetchPromise =
      domainId === "ALL"
        ? adminApi.getAllAdminTopics()
        : adminApi.getAdminTopicsByDomain(domainId);

    fetchPromise
      .then((data) => setTopics(data ?? []))
      .catch((err: any) => {
        setTopics([]);
        toast.error(err?.message || "Failed to load topics");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopics(selectedDomainId);
  }, [selectedDomainId]);

  function handleOpenCreate() {
    setEditingTopic(null);
    const defaultDomainId =
      selectedDomainId !== "ALL"
        ? selectedDomainId
        : domains[0]?.id ?? 1;
    setCreateTopicDomainId(defaultDomainId);
    setFormData({
      name: "",
      description: "",
      sequenceNumber: topics.length + 1,
      difficulty: "BEGINNER",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(topic: Topic) {
    setEditingTopic(topic);
    setCreateTopicDomainId(topic.domainId ?? domains[0]?.id ?? 1);
    setFormData({
      name: topic.name,
      description: topic.description ?? "",
      sequenceNumber: topic.sequenceNumber ?? 1,
      difficulty: topic.difficulty ?? "BEGINNER",
      status: topic.status ?? "ACTIVE",
    });
    setIsModalOpen(true);
  }

  async function handleSubmitTopic(e: FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Topic name is required");
      return;
    }

    const domainToUse = editingTopic
      ? editingTopic.domainId
      : createTopicDomainId || (selectedDomainId !== "ALL" ? selectedDomainId : domains[0]?.id);

    if (!domainToUse) {
      toast.error("Please select a valid domain for this topic");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTopic) {
        await adminApi.updateTopic(editingTopic.id, formData);
        toast.success(`Topic "${formData.name}" updated successfully`);
      } else {
        await adminApi.createTopic(domainToUse, formData);
        toast.success(`Topic "${formData.name}" created successfully`);
      }
      setIsModalOpen(false);
      fetchTopics(selectedDomainId);
    } catch (err: any) {
      toast.error(err?.message || (editingTopic ? "Failed to update topic" : "Failed to create topic"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExecuteDelete() {
    if (!pendingDeleteTopic) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteTopic(pendingDeleteTopic.id);
      setTopics((prev) => prev.filter((t) => t.id !== pendingDeleteTopic.id));
      toast.success(`Topic "${pendingDeleteTopic.name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete topic");
    } finally {
      setIsDeleting(false);
      setPendingDeleteTopic(null);
    }
  }

  const filteredTopics = topics
    .filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.difficulty ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0));

  const columns: Column<Topic>[] = [
    {
      header: "Seq #",
      accessor: (t) => (
        <span
          style={{
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            background: "rgba(99, 102, 241, 0.1)",
            color: "var(--color-primary)",
            fontWeight: 800,
            fontSize: "var(--text-xs)",
          }}
        >
          #{t.sequenceNumber ?? 1}
        </span>
      ),
    },
    {
      header: "Topic Name",
      accessor: (t) => {
        const domain = domains.find((d) => d.id === t.domainId);
        return (
          <div>
            <strong style={{ color: "var(--color-ink)", display: "block" }}>{t.name}</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
              /{t.slug} • Domain: <span className="status-pill in-progress" style={{ fontSize: "0.7rem", padding: "0.1rem 0.45rem" }}>{domain?.name ?? `Domain #${t.domainId}`}</span>
            </span>
          </div>
        );
      },
    },
    {
      header: "Description",
      accessor: (t) => (
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: "22rem" }}>
          {t.description ?? "No description"}
        </span>
      ),
    },
    {
      header: "Difficulty",
      accessor: (t) => <span className="status-pill in-progress">{t.difficulty ?? "BEGINNER"}</span>,
    },
    {
      header: "Actions",
      accessor: (t) => (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <Button variant="ghost" onClick={() => handleOpenEdit(t)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}>
            <Icon name="pencil" size={14} />
            Edit
          </Button>
          <Button variant="ghost" onClick={() => setPendingDeleteTopic(t)} style={{ padding: "0.25rem 0.55rem", minHeight: "2rem", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>
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
        <PageHeader
          title={selectedDomainId === "ALL" ? "Topic Management: All Domains" : `Topic Management: ${currentDomain?.name ?? "Selected Domain"}`}
          description={selectedDomainId === "ALL" ? "View and manage topics across all learning domains in the platform." : `Create, order, and manage learning topics within domain "${currentDomain?.name ?? ""}".`}
        />
        <Button variant="primary" onClick={handleOpenCreate}>
          <Icon name="plus" size={16} />
          Create New Topic
        </Button>
      </div>

      {/* Domain Switcher Cards / Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--color-muted)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase" }}>
          Switch Domain Context:
        </span>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setSearchParams({ domainId: "all" })}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-md)",
              border: selectedDomainId === "ALL" ? "1.5px solid var(--color-primary)" : "1px solid var(--color-line)",
              background: selectedDomainId === "ALL" ? "rgba(99, 102, 241, 0.12)" : "var(--color-surface)",
              color: selectedDomainId === "ALL" ? "var(--color-primary)" : "var(--color-ink)",
              fontWeight: selectedDomainId === "ALL" ? 800 : 500,
              fontSize: "var(--text-xs)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Icon name="grid" size={14} />
            All Domains
          </button>

          {domains.map((d) => {
            const isSelected = selectedDomainId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSearchParams({ domainId: String(d.id) })}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: isSelected ? "1.5px solid var(--color-primary)" : "1px solid var(--color-line)",
                  background: isSelected ? "rgba(99, 102, 241, 0.1)" : "var(--color-surface)",
                  color: isSelected ? "var(--color-primary)" : "var(--color-ink)",
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: "var(--text-xs)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Icon name="compass" size={14} />
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search topic filter */}
      <div style={{ marginBottom: "1.25rem", position: "relative", maxWidth: "20rem" }}>
        <Icon name="search" size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
        <input
          type="text"
          placeholder="Search topics by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", height: "2.35rem", paddingLeft: "2.25rem", paddingRight: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-surface)", color: "var(--color-ink)", fontSize: "var(--text-sm)" }}
        />
      </div>

      {loading ? (
        <LoadingState message="Loading topics..." />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredTopics}
          emptyMessage={
            selectedDomainId === "ALL"
              ? "No topics have been created yet. Click 'Create New Topic' above."
              : `No topics found for domain "${currentDomain?.name ?? "Selected Domain"}". Click 'Create New Topic' above to add one.`
          }
        />
      )}

      {/* Reusable AdminModal for Create/Edit */}
      <AdminModal isOpen={isModalOpen} title={editingTopic ? "Edit Topic" : "Create New Topic"} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmitTopic} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Domain Selection */}
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Domain *</span>
            <select
              value={createTopicDomainId}
              onChange={(e) => setCreateTopicDomainId(Number(e.target.value))}
              disabled={Boolean(editingTopic)}
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
            <span>Topic Name *</span>
            <input
              type="text"
              required
              placeholder="e.g. Spring Security JWT Authentication"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
            <span>Description</span>
            <textarea
              rows={3}
              placeholder="Topic description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: "0.6rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)", fontFamily: "inherit" }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              <span>Sequence Order</span>
              <input
                type="number"
                min={1}
                value={formData.sequenceNumber}
                onChange={(e) => setFormData({ ...formData, sequenceNumber: Number(e.target.value) })}
                style={{ height: "2.5rem", padding: "0 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-line)", background: "var(--color-paper)", color: "var(--color-ink)" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              <span>Difficulty</span>
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
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingTopic ? "Update Topic" : "Save Topic"}
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={Boolean(pendingDeleteTopic)}
        title="Delete Topic"
        message={`Are you sure you want to delete the topic "${pendingDeleteTopic?.name}"? All associated resources in this topic will also be cleanly removed.`}
        confirmLabel="Delete Topic"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDelete}
        onClose={() => setPendingDeleteTopic(null)}
      />
    </section>
  );
}
