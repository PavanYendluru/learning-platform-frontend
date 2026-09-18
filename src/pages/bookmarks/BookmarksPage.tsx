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
                  <span
                    className="resource-type-badge"
                    style={{ position: "static", display: "inline-block", marginBottom: "0.4rem" }}
                  >
                    {bookmark.resourceType}
                  </span>
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
