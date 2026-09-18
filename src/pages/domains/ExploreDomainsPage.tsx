import { useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { DomainCard } from "../../components/domains/DomainCard";
import { Icon } from "../../components/layout/Icon";
import { useDomains } from "../../hooks/useDomains";
import "./ExploreDomainsPage.css";

type FilterDifficulty = "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export function ExploreDomainsPage() {
  const { domains, loading, usingFallback, error } = useDomains();

  const [query, setQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterDifficulty>("ALL");

  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      const matchesQuery =
        !query ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.description.toLowerCase().includes(query.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === "ALL" ||
        d.difficulty?.toUpperCase() === selectedDifficulty;

      return matchesQuery && matchesDifficulty;
    });
  }, [domains, query, selectedDifficulty]);

  return (
    <section className="domains-content">
      <PageHeader
        title="Explore Domains"
        description="Discover specialized learning domains, structured topics, and curated resources."
      />

      {usingFallback && (
        <div className="fallback-note">
          Showing preview domain data while backend is initializing.
        </div>
      )}

      <div className="domains-toolbar">
        <label className="domain-search-input">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Search domains..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="difficulty-filters" role="group" aria-label="Filter by difficulty">
          {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              className={`filter-btn ${selectedDifficulty === diff ? "active" : ""}`}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching learning domains..." />
      ) : error && !usingFallback ? (
        <ErrorState message={error} />
      ) : filteredDomains.length > 0 ? (
        <div className="domains-grid">
          {filteredDomains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No domains found"
          message={query ? `No learning domains match "${query}".` : "No domains are currently available."}
          icon="compass"
        />
      )}
    </section>
  );
}
