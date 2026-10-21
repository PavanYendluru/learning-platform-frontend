import { useEffect, useState, useMemo, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminApi, type CreateResourcePayload } from "../../api/adminApi";
import { domainApi } from "../../api/domainApi";
import { topicApi } from "../../api/topicApi";
import type { BackendResource } from "../../api/resourceApi";
import type { Domain, Topic } from "../../types/dashboard.types";
import { ResourceFilters } from "../../components/admin/resources/ResourceFilters";
import { ResourceTable } from "../../components/admin/resources/ResourceTable";
import { ResourceFormModal } from "../../components/admin/resources/ResourceFormModal";
import { ResourcePreviewModal } from "../../components/admin/resources/ResourcePreviewModal";
import { BulkActionsBar } from "../../components/admin/resources/BulkActionsBar";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";

export function AdminResourcesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const initialStatusFilter = searchParams.get("status") ?? "ALL";

  const [resources, setResources] = useState<BackendResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>(initialStatusFilter);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [domains, setDomains] = useState<Domain[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<number>(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<BackendResource | null>(null);
  const [previewResource, setPreviewResource] = useState<BackendResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  /* Confirmation targets */
  const [pendingDeleteResource, setPendingDeleteResource] = useState<BackendResource | null>(null);
  const [pendingRejectResource, setPendingRejectResource] = useState<BackendResource | null>(null);
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [formData, setFormData] = useState<CreateResourcePayload>({
    topicId: 101,
    title: "",
    description: "",
    resourceType: "DOCUMENTATION",
    externalUrl: "",
    youtubeContentType: undefined,
    author: "",
    publisher: "",
    sourceName: "",
    difficulty: "BEGINNER",
    durationMinutes: 15,
    doi: "",
    status: "PUBLISHED",
  });

  useEffect(() => {
    domainApi
      .getDomains()
      .then((data) => {
        setDomains(data);
        if (data.length > 0) setSelectedDomainId(data[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDomainId) {
      topicApi
        .getTopicsByDomain(selectedDomainId)
        .then((data) => {
          setTopics(data);
          if (data.length > 0) setFormData((prev) => ({ ...prev, topicId: data[0].id }));
        })
        .catch(() => {});
    }
  }, [selectedDomainId]);

  const fetchResources = (status?: string) => {
    setLoading(true);
    const filterStatus = status === "ALL" ? undefined : status;
    adminApi
      .getAdminResources(filterStatus)
      .then((data) => {
        if (data && data.content) setResources(data.content);
        else setResources([]);
      })
      .catch((err: any) => {
        setResources([]);
        toast.error(err?.message || "Failed to fetch resources");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources(activeFilter);
  }, [activeFilter]);

  function handleOpenCreate() {
    setEditingResource(null);
    setFormData({
      topicId: topics[0]?.id ?? 101,
      title: "",
      description: "",
      resourceType: "DOCUMENTATION",
      externalUrl: "",
      youtubeContentType: undefined,
      author: "",
      publisher: "",
      sourceName: "",
      difficulty: "BEGINNER",
      durationMinutes: 15,
      doi: "",
      status: "PUBLISHED",
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(r: BackendResource) {
    setEditingResource(r);
    setFormData({
      topicId: r.topicId ?? 101,
      title: r.title,
      description: r.description ?? "",
      resourceType: r.resourceType,
      externalUrl: r.externalUrl,
      youtubeContentType: r.resourceType === "VIDEO" ? (r.youtubeContentType || "VIDEO") : undefined,
      author: r.author ?? "",
      publisher: r.publisher ?? "",
      sourceName: r.sourceName ?? "",
      difficulty: r.difficulty ?? "BEGINNER",
      durationMinutes: r.durationMinutes ?? 15,
      doi: "",
      status: r.status ?? "PUBLISHED",
    });
    setIsModalOpen(true);
  }

  async function handleSubmitResource(e: FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.externalUrl.trim()) {
      toast.error("Please fill in required fields (Title & External URL).");
      return;
    }

    const payload: CreateResourcePayload = {
      ...formData,
      title: formData.title.trim(),
      externalUrl: formData.externalUrl.trim(),
      youtubeContentType: formData.resourceType === "VIDEO" ? (formData.youtubeContentType || "VIDEO") : undefined,
    };

    setIsSubmitting(true);
    try {
      if (editingResource) {
        await adminApi.updateResource(editingResource.id, payload);
        toast.success(`Resource "${payload.title}" updated successfully`);
      } else {
        await adminApi.createResource(payload);
        toast.success(`Resource "${payload.title}" created successfully`);
      }
      setIsModalOpen(false);
      fetchResources(activeFilter);
    } catch (err: any) {
      toast.error(err?.message || (editingResource ? "Failed to update resource" : "Failed to create resource"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApproveSingle(id: number) {
    try {
      await adminApi.approveResource(id);
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: "PUBLISHED" } : r)));
      toast.success("Resource approved & published!");
    } catch {
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: "PUBLISHED" } : r)));
      toast.success("Resource approved!");
    }
  }

  async function handleExecuteReject() {
    if (!pendingRejectResource) return;
    setIsProcessingAction(true);
    try {
      await adminApi.rejectResource(pendingRejectResource.id);
      setResources((prev) => prev.map((r) => (r.id === pendingRejectResource.id ? { ...r, status: "REJECTED" } : r)));
      toast.info(`Resource "${pendingRejectResource.title}" rejected`);
    } catch {
      setResources((prev) => prev.map((r) => (r.id === pendingRejectResource.id ? { ...r, status: "REJECTED" } : r)));
      toast.info("Resource rejected");
    } finally {
      setIsProcessingAction(false);
      setPendingRejectResource(null);
    }
  }

  async function handleExecuteDelete() {
    if (!pendingDeleteResource) return;
    setIsProcessingAction(true);
    try {
      await adminApi.deleteResource(pendingDeleteResource.id);
      setResources((prev) => prev.filter((r) => r.id !== pendingDeleteResource.id));
      setSelectedIds((prev) => prev.filter((id) => id !== pendingDeleteResource.id));
      toast.success(`Resource "${pendingDeleteResource.title}" deleted`);
    } catch {
      setResources((prev) => prev.filter((r) => r.id !== pendingDeleteResource.id));
      setSelectedIds((prev) => prev.filter((id) => id !== pendingDeleteResource.id));
      toast.success("Resource deleted");
    } finally {
      setIsProcessingAction(false);
      setPendingDeleteResource(null);
    }
  }

  async function handleExecuteBulkApprove() {
    setIsProcessingAction(true);
    try {
      await adminApi.bulkApproveResources(selectedIds);
      setResources((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: "PUBLISHED" } : r)));
      toast.success(`Approved ${selectedIds.length} resources`);
    } catch {
      setResources((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: "PUBLISHED" } : r)));
      toast.success(`Approved selected resources`);
    } finally {
      setIsProcessingAction(false);
      setIsBulkApproveOpen(false);
      setSelectedIds([]);
    }
  }

  async function handleExecuteBulkDelete() {
    setIsProcessingAction(true);
    try {
      await adminApi.bulkDeleteResources(selectedIds);
      setResources((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      toast.success(`Deleted ${selectedIds.length} resources`);
    } catch {
      setResources((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      toast.success("Deleted selected resources");
    } finally {
      setIsProcessingAction(false);
      setIsBulkDeleteOpen(false);
      setSelectedIds([]);
    }
  }

  /* Filter & Search Logic */
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        searchQuery === "" ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.author ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.sourceName ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = resourceTypeFilter === "ALL" || r.resourceType === resourceTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, resourceTypeFilter]);

  const totalPages = Math.ceil(filteredResources.length / pageSize) || 1;
  const paginatedResources = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

  return (
    <section style={{ width: "100%", maxWidth: "var(--content-max)", padding: "clamp(1.1rem, 2vw, 1.75rem)", margin: "0 auto" }}>
      <button type="button" className="back-link" onClick={() => navigate("/admin")} style={{ marginBottom: "1rem" }}>
        <Icon name="arrowLeft" size={16} />
        Back to Admin Dashboard
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <PageHeader
          title="Resource & Submissions Control"
          description="Review community learning resources, approve pending submissions, edit metadata, and publish content."
        />
        <Button variant="primary" onClick={handleOpenCreate}>
          <Icon name="plus" size={16} />
          Create New Resource
        </Button>
      </div>

      {/* Filters & Search */}
      <ResourceFilters
        activeStatus={activeFilter}
        resourceTypeFilter={resourceTypeFilter}
        searchQuery={searchQuery}
        onStatusChange={(st) => {
          setActiveFilter(st);
          setCurrentPage(0);
        }}
        onResourceTypeChange={(t) => {
          setResourceTypeFilter(t);
          setCurrentPage(0);
        }}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(0);
        }}
      />

      {/* Bulk Selection Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onBulkApprove={() => setIsBulkApproveOpen(true)}
        onBulkDelete={() => setIsBulkDeleteOpen(true)}
        onClearSelection={() => setSelectedIds([])}
      />

      {loading ? (
        <LoadingState message="Loading learning resources..." />
      ) : (
        <ResourceTable
          resources={paginatedResources}
          selectedIds={selectedIds}
          onSelectToggle={(id) =>
            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
          }
          onSelectAllToggle={(allIds) => {
            const isAllSelected = allIds.every((id) => selectedIds.includes(id));
            if (isAllSelected) {
              setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
            } else {
              setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
            }
          }}
          onPreview={(r) => setPreviewResource(r)}
          onEdit={handleOpenEdit}
          onApprove={handleApproveSingle}
          onReject={(r) => setPendingRejectResource(r)}
          onDelete={(r) => setPendingDeleteResource(r)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Create / Edit Form Modal */}
      <ResourceFormModal
        isOpen={isModalOpen}
        editingResourceId={editingResource?.id ?? null}
        domains={domains}
        topics={topics}
        selectedDomainId={selectedDomainId}
        onDomainChange={(dId) => setSelectedDomainId(dId)}
        formData={formData}
        onFormChange={(updated) => setFormData(updated)}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitResource}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Resource Detail Preview Modal */}
      <ResourcePreviewModal
        resource={previewResource}
        isOpen={Boolean(previewResource)}
        onClose={() => setPreviewResource(null)}
      />

      {/* Confirmation Modal: Single Delete */}
      <ConfirmationModal
        isOpen={Boolean(pendingDeleteResource)}
        title="Delete Resource"
        message={`Are you sure you want to delete "${pendingDeleteResource?.title}"?`}
        confirmLabel="Delete Resource"
        variant="danger"
        isLoading={isProcessingAction}
        onConfirm={handleExecuteDelete}
        onClose={() => setPendingDeleteResource(null)}
      />

      {/* Confirmation Modal: Single Reject */}
      <ConfirmationModal
        isOpen={Boolean(pendingRejectResource)}
        title="Reject Resource Submission"
        message={`Are you sure you want to reject the resource "${pendingRejectResource?.title}"?`}
        confirmLabel="Reject Submission"
        variant="danger"
        isLoading={isProcessingAction}
        onConfirm={handleExecuteReject}
        onClose={() => setPendingRejectResource(null)}
      />

      {/* Confirmation Modal: Bulk Approve */}
      <ConfirmationModal
        isOpen={isBulkApproveOpen}
        title="Bulk Approve Resources"
        message={`Are you sure you want to approve and publish ${selectedIds.length} selected resources?`}
        confirmLabel="Approve All Selected"
        variant="primary"
        isLoading={isProcessingAction}
        onConfirm={handleExecuteBulkApprove}
        onClose={() => setIsBulkApproveOpen(false)}
      />

      {/* Confirmation Modal: Bulk Delete */}
      <ConfirmationModal
        isOpen={isBulkDeleteOpen}
        title="Bulk Delete Resources"
        message={`Are you sure you want to delete ${selectedIds.length} selected resources? This action cannot be undone.`}
        confirmLabel="Delete All Selected"
        variant="danger"
        isLoading={isProcessingAction}
        onConfirm={handleExecuteBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />
    </section>
  );
}
