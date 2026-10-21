import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useBookmarks } from "../../hooks/useBookmarks";
import "./BookmarksPage.css";

export function BookmarksPage() {
  const navigate = useNavigate();
  const { bookmarks, loading, usingFallback, error, removeBookmark } = useBookmarks();

  return (
    <section className="bookmarks-content">
      <PageHeader
        title="Bookmarks"
        description="Access and manage your saved learning resources in one centralized place."
      />

      {usingFallback && (
        <div className="fallback-note">
          Showing preview bookmarks while backend is initializing.
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading your bookmarks..." />
      ) : error && !usingFallback ? (
        <ErrorState message={error} />
      ) : bookmarks.length > 0 ? (
        <div className="bookmarks-grid">
          {bookmarks.map((bookmark) => (
            <article key={bookmark.id} className="bookmark-card card">
              <div className="bookmark-header">
                <div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                    <span
                      className="resource-type-badge"
                      style={{ position: "static", display: "inline-block" }}
                    >
                      {bookmark.resourceType}
                    </span>
                    {bookmark.domainName && (
                      <button
                        type="button"
                        style={{
                          border: "none",
                          background: "var(--color-primary-light, rgba(99, 102, 241, 0.1))",
                          color: "var(--color-primary)",
                          fontSize: "var(--text-xs)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={() => bookmark.domainId && navigate(`/domains/${bookmark.domainId}`)}
                        title={`Go to domain: ${bookmark.domainName}`}
                      >
                        {bookmark.domainName}
                      </button>
                    )}
                    {bookmark.topicName && (
                      <button
                        type="button"
                        style={{
                          border: "none",
                          background: "var(--color-surface-hover, rgba(0,0,0,0.05))",
                          color: "var(--color-muted)",
                          fontSize: "var(--text-xs)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          bookmark.domainId &&
                          bookmark.topicId &&
                          navigate(`/domains/${bookmark.domainId}/topics/${bookmark.topicId}`)
                        }
                        title={`Go to topic: ${bookmark.topicName}`}
                      >
                        › {bookmark.topicName}
                      </button>
                    )}
                  </div>
                  <h3>{bookmark.resourceTitle}</h3>
                </div>

                <button
                  type="button"
                  className="remove-bookmark-btn"
                  onClick={() => removeBookmark(bookmark.resourceId)}
                  aria-label="Remove bookmark"
                  title="Remove bookmark"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>

              <div className="bookmark-card-footer">
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/resources/${bookmark.resourceId}`)}
                >
                  View Details
                </Button>

                {bookmark.externalUrl && (
                  <a
                    href={bookmark.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="primary">
                      <Icon name="externalLink" size={14} />
                      Open Link
                    </Button>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No bookmarks saved"
          message="When you bookmark learning resources, they will appear here."
          icon="bookmark"
        />
      )}
    </section>
  );
}
