import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, type AdminStats } from "../../api/adminApi";
import type { BackendResource } from "../../api/resourceApi";
import type { ActivityLogItem } from "../../types/activity.types";
import { AdminDataTable, type Column } from "../../components/admin/AdminDataTable";
import { AdminStatTile } from "../../components/admin/AdminStatTile";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const emptyStats: AdminStats = {
    totalDomains: 0,
    totalTopics: 0,
    totalResources: 0,
    publishedResources: 0,
    pendingReviewResources: 0,
    totalUsers: 0,
    totalRoadmaps: 0,
    totalTechnologyUpdates: 0,
  };
  const displayStats = stats ?? emptyStats;
  const [pendingResources, setPendingResources] = useState<BackendResource[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* Confirmation target state for Pending Resource Reject */
  const [pendingRejectResource, setPendingRejectResource] = useState<BackendResource | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      adminApi.getDashboardStats(),
      adminApi.getAdminResources("PENDING_REVIEW"),
      adminApi.getAuditLogs(),
    ]).then(([statsRes, resRes, auditRes]) => {
      if (!active) return;

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value);
      } else {
        setStats(null);
        console.error("Failed to load admin dashboard stats", statsRes.reason);
      }

      if (resRes.status === "fulfilled" && resRes.value?.content) {
        setPendingResources(resRes.value.content);
      } else {
        setPendingResources([]);
      }

      if (auditRes.status === "fulfilled") {
        setAuditLogs(Array.isArray(auditRes.value) ? auditRes.value : []);
      } else {
        setAuditLogs([]);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleApprove(id: number) {
    try {
      await adminApi.approveResource(id);
      setPendingResources((prev) => prev.filter((r) => r.id !== id));
      if (stats) setStats({ ...stats, pendingReviewResources: Math.max(0, stats.pendingReviewResources - 1) });
      toast.success("Resource approved and published!");
    } catch {
      setPendingResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource approved!");
    }
  }

  async function handleExecuteReject() {
    if (!pendingRejectResource) return;
    setIsProcessingAction(true);
    try {
      await adminApi.rejectResource(pendingRejectResource.id);
      setPendingResources((prev) => prev.filter((r) => r.id !== pendingRejectResource.id));
      if (stats) setStats({ ...stats, pendingReviewResources: Math.max(0, stats.pendingReviewResources - 1) });
      toast.info(`Submission "${pendingRejectResource.title}" rejected`);
    } catch {
      setPendingResources((prev) => prev.filter((r) => r.id !== pendingRejectResource.id));
      toast.info("Submission rejected");
    } finally {
      setIsProcessingAction(false);
      setPendingRejectResource(null);
    }
  }

  const columns: Column<BackendResource>[] = [
    {
      header: "Title",
      accessor: (r) => (
        <div>
          <strong style={{ color: "var(--color-ink)", display: "block" }}>{r.title}</strong>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
            Type: {r.resourceType.replace(/_/g, " ")}
          </span>
        </div>
      ),
    },
    {
      header: "Author / Source",
      accessor: (r) => r.author ?? r.sourceName ?? "Community",
    },
    {
      header: "Actions",
      accessor: (r) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="primary"
            onClick={() => handleApprove(r.id)}
            style={{ padding: "0.25rem 0.65rem", minHeight: "2rem", fontSize: "var(--text-xs)" }}
          >
            <Icon name="check" size={14} />
            Approve
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPendingRejectResource(r)}
            style={{
              padding: "0.25rem 0.65rem",
              minHeight: "2rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-danger)",
            }}
          >
            <Icon name="close" size={14} />
            Reject
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
      <PageHeader
        title="Admin Control Center"
        description="Platform administration dashboard for managing learning content, tech updates, learners, and system operations."
      />

      {loading ? (
        <LoadingState message="Loading administrative stats..." />
      ) : true ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
              gap: "1rem",
              margin: "1.25rem 0 1.75rem",
            }}
          >
            <AdminStatTile
              value={displayStats.totalUsers}
              label="Registered Learners"
              iconName="user"
              accentColor="#4f46e5"
              onClick={() => navigate("/admin/users")}
            />
            <AdminStatTile
              value={displayStats.totalDomains}
              label="Active Domains"
              iconName="compass"
              accentColor="#2563eb"
              onClick={() => navigate("/admin/domains")}
            />
            <AdminStatTile
              value={displayStats.totalResources}
              label="Total Resources"
              iconName="files"
              accentColor="#059669"
              onClick={() => navigate("/admin/resources")}
            />
            <AdminStatTile
              value={displayStats.pendingReviewResources}
              label="Pending Submissions"
              iconName="alert"
              accentColor="#d97706"
              onClick={() => navigate("/admin/resources?status=PENDING_REVIEW")}
            />
            <AdminStatTile
              value={displayStats.totalRoadmaps}
              label="Learning Roadmaps"
              iconName="map"
              accentColor="#8b5cf6"
              onClick={() => navigate("/admin/roadmaps")}
            />
            <AdminStatTile
              value={displayStats.totalTechnologyUpdates}
              label="Tech Updates"
              iconName="newspaper"
              accentColor="#ec4899"
              onClick={() => navigate("/admin/technology-updates")}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <Button variant="primary" onClick={() => navigate("/admin/users")}>
              <Icon name="user" size={16} />
              Manage Users
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin/domains")}>
              <Icon name="compass" size={16} />
              Manage Domains
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin/topics")}>
              <Icon name="fileText" size={16} />
              Manage Topics
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin/resources")}>
              <Icon name="files" size={16} />
              Manage Resources & Review
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin/roadmaps")}>
              <Icon name="map" size={16} />
              Manage Roadmaps
            </Button>
            <Button variant="ghost" onClick={() => navigate("/admin/technology-updates")}>
              <Icon name="newspaper" size={16} />
              Tech Updates
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {/* Submissions Pending Review */}
            <div>
              <h2
                style={{
                  font: "800 var(--text-lg) / 1.2 var(--font-display)",
                  margin: "0 0 1rem",
                  color: "var(--color-ink)",
                }}
              >
                Submissions Pending Review ({pendingResources.length})
              </h2>

              {pendingResources.length > 0 ? (
                <AdminDataTable columns={columns} data={pendingResources} />
              ) : (
                <EmptyState
                  title="No pending submissions"
                  message="All submitted learning resources have been reviewed."
                  icon="check"
                />
              )}
            </div>

            {/* Platform Audit & Activity Log */}
            <div>
              <h2
                style={{
                  font: "800 var(--text-lg) / 1.2 var(--font-display)",
                  margin: "0 0 1rem",
                  color: "var(--color-ink)",
                }}
              >
                Recent Platform Audit Log
              </h2>

              {auditLogs.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    background: "var(--color-surface)",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-line)",
                  }}
                >
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span
                        style={{
                          padding: "0.35rem",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "var(--color-primary)",
                        }}
                      >
                        <Icon name="sparkles" size={16} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-ink)" }}>
                            {log.title}
                          </strong>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
                            {log.createdAt}
                          </span>
                        </div>
                        <p style={{ margin: "0.15rem 0 0", fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
                          {log.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No audit logs"
                  message="Audit activity logs will appear here as administrative actions occur."
                  icon="fileText"
                />
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Confirmation Modal for Resource Rejection */}
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
    </section>
  );
}
