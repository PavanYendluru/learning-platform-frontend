import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { domainApi } from "../../api/domainApi";
import { topicApi, type BackendTopic } from "../../api/topicApi";
import { resourceApi, type BackendResource } from "../../api/resourceApi";
import { bookmarkApi } from "../../api/bookmarkApi";
import { apiClient } from "../../api/apiClient";
import type { ApiResponse } from "../../types/auth.types";
import type { Domain } from "../../types/dashboard.types";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";
import "./TopicDetailsPage.css";

export function TopicDetailsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { domainId: domainIdParam, topicId: topicIdParam } = useParams<{
    domainId: string;
    topicId: string;
  }>();

  const domainId = Number(domainIdParam) || 1;
  const topicId = Number(topicIdParam) || 101;

  const [domain, setDomain] = useState<Domain | null>(null);
  const [topic, setTopic] = useState<BackendTopic | null>(null);
  const [resources, setResources] = useState<BackendResource[]>([]);
  const [completedResourceIds, setCompletedResourceIds] = useState<number[]>([]);
  const [bookmarkedResourceIds, setBookmarkedResourceIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.allSettled([
      domainApi.getDomainById(domainId),
      topicApi.getTopicById(topicId),
      resourceApi.searchResources({ topicId }),
      bookmarkApi.getMyBookmarks(),
      apiClient<ApiResponse<{ resourceId: number }[]>>("/users/completed-resources"),
    ]).then(([domainRes, topicRes, resourcesRes, bookmarksRes, completedRes]) => {
      if (!active) return;

      if (domainRes.status === "fulfilled" && domainRes.value) {
        setDomain(domainRes.value);
      } else {
        setDomain(null);
      }

      if (topicRes.status === "fulfilled" && topicRes.value) {
        setTopic(topicRes.value);
      } else {
        setTopic(null);
      }

      if (resourcesRes.status === "fulfilled" && resourcesRes.value?.content) {
        setResources(resourcesRes.value.content);
      } else {
        setResources([]);
      }

      if (bookmarksRes.status === "fulfilled") {
        const bm = bookmarksRes.value as any;
        const list = Array.isArray(bm) ? bm : (bm?.data && Array.isArray(bm.data) ? bm.data : []);
        setBookmarkedResourceIds(list.map((b: any) => b.resourceId).filter(Boolean));
      } else {
        setBookmarkedResourceIds([]);
      }

      if (completedRes.status === "fulfilled" && completedRes.value?.success && Array.isArray(completedRes.value.data)) {
        setCompletedResourceIds(completedRes.value.data.map((c: any) => c.resourceId).filter(Boolean));
      } else {
        setCompletedResourceIds([]);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [domainId, topicId]);

  const completionPct = useMemo(() => {
    if (resources.length === 0) return 0;
    const completedCount = resources.filter((r) => completedResourceIds.includes(r.id)).length;
    return Math.round((completedCount / resources.length) * 100);
  }, [resources, completedResourceIds]);

  async function handleToggleComplete(resourceId: number, title: string) {
    const isCompleted = completedResourceIds.includes(resourceId);
    try {
      if (isCompleted) {
        await apiClient(`/users/progress/resource/${resourceId}`, { method: "DELETE" });
        setCompletedResourceIds((prev) => prev.filter((id) => id !== resourceId));
        toast.info(`Marked "${title}" as in progress`);
      } else {
        await apiClient(`/users/progress/resource/${resourceId}`, { method: "POST" });
        setCompletedResourceIds((prev) => [...prev, resourceId]);
        toast.success(`Marked "${title}" as completed! 🎉`);
      }
    } catch {
      // Local optimistic toggle fallback
      if (isCompleted) {
        setCompletedResourceIds((prev) => prev.filter((id) => id !== resourceId));
        toast.info(`Marked as in progress`);
      } else {
        setCompletedResourceIds((prev) => [...prev, resourceId]);
        toast.success(`Marked as completed! 🎉`);
      }
    }
  }

  async function handleToggleBookmark(resourceId: number, title: string) {
    const isBookmarked = bookmarkedResourceIds.includes(resourceId);
    try {
      if (isBookmarked) {
        await bookmarkApi.removeBookmark(resourceId);
        setBookmarkedResourceIds((prev) => prev.filter((id) => id !== resourceId));
        toast.info(`Removed "${title}" from bookmarks`);
      } else {
        await bookmarkApi.addBookmark(resourceId);
        setBookmarkedResourceIds((prev) => [...prev, resourceId]);
        toast.success(`Bookmarked "${title}"`);
      }
    } catch {
      if (isBookmarked) {
        setBookmarkedResourceIds((prev) => prev.filter((id) => id !== resourceId));
        toast.info(`Removed bookmark`);
      } else {
        setBookmarkedResourceIds((prev) => [...prev, resourceId]);
        toast.success(`Bookmarked resource`);
      }
    }
  }

  if (loading) {
    return (
      <section className="topic-details-content">
        <LoadingState message="Loading topic details and learning resources..." />
      </section>
    );
  }

  return (
    <section className="topic-details-content">
      {/* Back Button */}
      <button type="button" className="back-link" onClick={() => navigate(`/domains/${domainId}`)}>
        <Icon name="arrowLeft" size={16} />
        Back to {domain?.name ?? "Domain Topics"}
      </button>

      {/* Topic Hero Card */}
      {topic && (
        <article className="topic-hero-card">
          <div className="topic-hero-meta">
            <span className="status-pill admin">{domain?.name ?? "Domain"}</span>
            <span className="sequence-badge">Stage #{topic.sequenceNumber ?? 1}</span>
            <span className="status-pill in-progress">{topic.difficulty ?? "BEGINNER"}</span>
          </div>

          <h1 className="topic-hero-title">{topic.name}</h1>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "var(--text-base)", lineHeight: 1.5 }}>
            {topic.description ?? "Explore curated video lessons, documentation guides, and practice resources."}
          </p>
        </article>
      )}

      {/* Topic Completion Progress Bar */}
      <div className="topic-progress-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-ink)" }}>
              Topic Completion Rate
            </strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", display: "block", marginTop: "0.15rem" }}>
              {resources.filter((r) => completedResourceIds.includes(r.id)).length} of {resources.length} resources completed
            </span>
          </div>
          <span style={{ font: "800 var(--text-xl) / 1 var(--font-display)", color: "var(--color-primary)" }}>
            {completionPct}%
          </span>
        </div>
        <div className="progress-track" style={{ height: "8px" }}>
          <span className="progress-fill" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Resources List */}
      <div>
        <h2 style={{ font: "800 var(--text-xl) / 1.2 var(--font-display)", margin: "0 0 1rem", color: "var(--color-ink)" }}>
          Learning Resources ({resources.length})
        </h2>

        {resources.length > 0 ? (
          <div className="topic-resources-list">
            {resources.map((res) => {
              const isCompleted = completedResourceIds.includes(res.id);
              const isBookmarked = bookmarkedResourceIds.includes(res.id);

              return (
                <article key={res.id} className="topic-resource-card">
                  <div className="topic-resource-info">
                    <div className="topic-resource-icon">
                      <Icon
                        name={
                          res.resourceType === "VIDEO"
                            ? "play"
                            : res.resourceType === "BOOK"
                            ? "bookMarked"
                            : res.resourceType === "RESEARCH_PAPER"
                            ? "fileText"
                            : "files"
                        }
                        size={22}
                      />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                        <strong style={{ fontSize: "var(--text-base)", color: "var(--color-ink)" }}>{res.title}</strong>
                        <span className="status-pill user">{res.resourceType.replace(/_/g, " ")}</span>
                        {res.durationMinutes && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
                            ⏱ {res.durationMinutes} min
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted)", lineHeight: 1.4 }}>
                        {res.description ?? "Access lesson contents and interactive reference guidelines."}
                      </p>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", display: "block", marginTop: "0.25rem" }}>
                        {res.author ? `By ${res.author}` : res.sourceName ? `Source: ${res.sourceName}` : "Curated Platform Resource"}
                      </span>
                    </div>
                  </div>

                  <div className="topic-resource-actions">
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleBookmark(res.id, res.title)}
                      style={{
                        padding: "0.35rem 0.65rem",
                        fontSize: "var(--text-xs)",
                        color: isBookmarked ? "var(--color-primary)" : "var(--color-muted)",
                      }}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Resource"}
                    >
                      <Icon name="bookmark" size={16} />
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>

                    <a href={res.externalUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <Button variant="ghost" style={{ padding: "0.35rem 0.65rem", fontSize: "var(--text-xs)" }}>
                        <Icon name="externalLink" size={16} />
                        Open
                      </Button>
                    </a>

                    <Button
                      variant={isCompleted ? "ghost" : "primary"}
                      onClick={() => handleToggleComplete(res.id, res.title)}
                      style={
                        isCompleted
                          ? {
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#10b981",
                              borderColor: "transparent",
                              padding: "0.35rem 0.75rem",
                              fontSize: "var(--text-xs)",
                            }
                          : {
                              padding: "0.35rem 0.75rem",
                              fontSize: "var(--text-xs)",
                            }
                      }
                    >
                      <Icon name="check" size={16} />
                      {isCompleted ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No resources for this topic"
            message="Check back soon as new learning videos and documentation guides are published."
            icon="files"
          />
        )}
      </div>
    </section>
  );
}
