import { useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { ResourceCard } from "../../components/resources/ResourceCard";
import { useResources } from "../../hooks/useResources";
import type { ResourceType } from "../../api/resourceApi";
import "./ResourcesPage.css";

type FilterType = "ALL" | ResourceType;

export function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<FilterType>("ALL");

  const searchParams = useMemo(() => ({
    q: query || undefined,
    resourceType: selectedType !== "ALL" ? selectedType : undefined,
  }), [query, selectedType]);

  const { resources, loading, usingFallback, error } = useResources(searchParams);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesQuery =
        !query ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase());

      const matchesType = selectedType === "ALL" || r.resourceType === selectedType;
      return matchesQuery && matchesType;
    });
  }, [resources, query, selectedType]);

  return (
    <section className="resources-content">
      <PageHeader
        title="Learning Resources"
        description="Explore YouTube videos, documentation, articles, books, and research papers."
      />

      {usingFallback && (
        <div className="fallback-note">
          Showing preview learning resources while backend is initializing.
        </div>
      )}

      <div className="resources-toolbar">
        <label className="resource-search-input">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="resource-type-filters" role="group" aria-label="Filter by resource type">
          {(["ALL", "VIDEO", "DOCUMENTATION", "ARTICLE", "BOOK", "RESEARCH_PAPER"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-btn ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching learning resources..." />
      ) : error && !usingFallback ? (
        <ErrorState message={error} />
      ) : filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No resources found"
          message={query ? `No learning resources match "${query}".` : "No learning resources available."}
          icon="files"
        />
      )}
    </section>
  );
}
