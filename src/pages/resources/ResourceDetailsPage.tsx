import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { resourceApi, type BackendResource } from "../../api/resourceApi";
import { fallbackResources } from "../../api/resourceFallback";
import { apiClient } from "../../api/apiClient";
import { Button } from "../../components/common/Button";
import { LoadingState } from "../../components/common/LoadingState";
import { Icon } from "../../components/layout/Icon";
import { useToast } from "../../hooks/useToast";
import "./ResourcesPage.css";

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const v = parsed.pathname.replace("/", "");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function ResourceDetailsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { resourceId: resourceIdParam } = useParams<{ resourceId: string }>();
  const resourceId = Number(resourceIdParam) || 1;

  const [resource, setResource] = useState<BackendResource | null>(
    () => fallbackResources.find((r) => r.id === resourceId) ?? fallbackResources[0]
  );
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    resourceApi
      .getResourceById(resourceId)
      .then((data) => {
        if (active && data) setResource(data);
      })
      .catch(() => {
        // Retain fallback resource
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resourceId]);

  const embedUrl = getYouTubeEmbedUrl(resource?.externalUrl);

  async function handleToggleBookmark() {
    if (!resource) return;
    try {
      if (bookmarked) {
        await dashboardApi.removeBookmark(resource.id);
        setBookmarked(false);
        toast.info("Removed from bookmarks");
      } else {
        await dashboardApi.addBookmark(resource.id);
        setBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch {
      setBookmarked((prev) => !prev);
      toast.success(bookmarked ? "Removed bookmark" : "Bookmarked resource");
    }
  }

  async function handleToggleComplete() {
    if (!resource) return;
    try {
      if (completed) {
        await apiClient(`/users/progress/resource/${resource.id}`, { method: "DELETE" });
        setCompleted(false);
        toast.info("Marked as in progress");
      } else {
        await apiClient(`/users/progress/resource/${resource.id}`, { method: "POST" });
        setCompleted(true);
        toast.success("Resource marked as completed! 🎉");
      }
    } catch {
      setCompleted((prev) => !prev);
      toast.success(completed ? "Marked as in progress" : "Marked as completed! 🎉");
    }
  }

  if (loading && !resource) {
    return (
      <section className="resources-content">
        <LoadingState message="Loading resource details..." />
      </section>
    );
  }

  return (
    <section className="resources-content">
      <button type="button" className="back-link" onClick={() => navigate("/resources")}>
        <Icon name="arrowLeft" size={16} />
        Back to Resources
      </button>

      {resource && (
        <article className="resource-detail-card">
          <div className="resource-detail-header">
            <span className="resource-type-badge" style={{ position: "static", display: "inline-block", marginBottom: "0.85rem" }}>
              {resource.resourceType}
            </span>
            <h1 style={{ font: "800 clamp(1.4rem, 2.2vw, 1.9rem) / 1.25 var(--font-display)", margin: "0 0 0.6rem", color: "var(--color-ink)" }}>
              {resource.title}
            </h1>
            <p style={{ fontSize: "var(--text-md)", color: "var(--color-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
              {resource.description}
            </p>

            <div className="resource-meta" style={{ fontSize: "var(--text-sm)" }}>
              {resource.author && <span>Author: <strong>{resource.author}</strong></span>}
              {resource.sourceName && <span>Source: <strong>{resource.sourceName}</strong></span>}
              {resource.durationMinutes && <span>Duration: <strong>{resource.durationMinutes} mins</strong></span>}
            </div>
          </div>

          {embedUrl ? (
            <div className="video-embed-wrapper">
              <iframe
                src={embedUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : resource.thumbnailUrl ? (
            <div style={{ height: "16rem", width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", margin: "1.25rem 0" }}>
              <img src={resource.thumbnailUrl} alt={resource.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : null}

          <div className="external-action-bar" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            {resource.externalUrl && (
              <a
                href={resource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button variant="primary">
                  <Icon name="externalLink" size={16} />
                  Open External Resource
                </Button>
              </a>
            )}

            <Button
              variant={completed ? "ghost" : "primary"}
              onClick={handleToggleComplete}
              style={
                completed
                  ? { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderColor: "transparent" }
                  : undefined
              }
            >
              <Icon name="check" size={16} />
              {completed ? "Completed" : "Mark as Complete"}
            </Button>

            <Button
              variant="ghost"
              onClick={handleToggleBookmark}
              style={{ color: bookmarked ? "var(--color-primary)" : undefined }}
            >
              <Icon name="bookmark" size={16} />
              {bookmarked ? "Bookmarked" : "Save Bookmark"}
            </Button>
          </div>
        </article>
      )}
    </section>
  );
}
