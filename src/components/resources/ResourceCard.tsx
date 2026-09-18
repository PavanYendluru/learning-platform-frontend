import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import type { BackendResource, ResourceType } from "../../api/resourceApi";
import { Icon, type IconName } from "../layout/Icon";

const iconByResourceType: Record<ResourceType, IconName> = {
  VIDEO: "video",
  BOOK: "code",
  DOCUMENTATION: "fileText",
  RESEARCH_PAPER: "newspaper",
  ARTICLE: "newspaper",
  COURSE: "cap",
  GITHUB: "code",
  PRACTICE: "check",
  PROJECT: "grid",
  TECHNOLOGY_UPDATE: "sparkles",
};

export function ResourceCard({ resource }: { resource: BackendResource }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const iconName = iconByResourceType[resource.resourceType] ?? "fileText";

  async function handleToggleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await dashboardApi.removeBookmark(resource.id);
        setBookmarked(false);
      } else {
        await dashboardApi.addBookmark(resource.id);
        setBookmarked(true);
      }
    } catch {
      // Toggle locally if API offline
      setBookmarked((prev) => !prev);
    } finally {
      setBookmarkLoading(false);
    }
  }

  return (
    <article
      className="resource-card card"
      onClick={() => navigate(`/resources/${resource.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/resources/${resource.id}`);
        }
      }}
    >
      <div className="resource-card-media">
        {resource.thumbnailUrl ? (
          <img src={resource.thumbnailUrl} alt={resource.title} loading="lazy" />
        ) : (
          <div className="resource-media-placeholder">
            <Icon name={iconName} size={36} />
          </div>
        )}
        <span className="resource-type-badge">{resource.resourceType}</span>
        <button
          type="button"
          className={`resource-bookmark-btn ${bookmarked ? "active" : ""}`}
          onClick={handleToggleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
          title={bookmarked ? "Remove bookmark" : "Save bookmark"}
        >
          <Icon name="bookmark" size={16} />
        </button>
      </div>

      <div className="resource-card-body">
        <h3>{resource.title}</h3>
        <p>{resource.description ?? "Access and study this learning resource."}</p>

        <div className="resource-meta">
          {resource.author && <span>By {resource.author}</span>}
          {resource.durationMinutes && (
            <span className="duration-tag">
              <Icon name="play" size={12} />
              {resource.durationMinutes} mins
            </span>
          )}
        </div>

        <div className="resource-card-footer">
          <span className="open-resource-btn">
            View Resource
            <Icon name="chevronRight" size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
