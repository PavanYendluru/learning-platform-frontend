import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { domainApi } from "../../api/domainApi";
import { fallbackDomains } from "../../api/domainFallback";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { Icon } from "../../components/layout/Icon";
import { TopicCard } from "../../components/topics/TopicCard";
import { useTopics } from "../../hooks/useTopics";
import type { Domain } from "../../types/dashboard.types";
import "./DomainDetailsPage.css";

export function DomainDetailsPage() {
  const navigate = useNavigate();
  const { domainId: domainIdParam } = useParams<{ domainId: string }>();
  const domainId = Number(domainIdParam) || 1;

  const [domain, setDomain] = useState<Domain | null>(
    () => fallbackDomains.find((d) => d.id === domainId) ?? fallbackDomains[0]
  );
  const [domainLoading, setDomainLoading] = useState(true);

  const { topics, loading: topicsLoading, error: topicsError } = useTopics(domainId);

  useEffect(() => {
    let active = true;
    domainApi
      .getDomainById(domainId)
      .then((data) => {
        if (active && data) setDomain(data);
      })
      .catch(() => {
        // Retain fallback domain if offline
      })
      .finally(() => {
        if (active) setDomainLoading(false);
      });

    return () => {
      active = false;
    };
  }, [domainId]);

  if (domainLoading && !domain) {
    return (
      <section className="domain-details-content">
        <LoadingState message="Loading domain details..." />
      </section>
    );
  }

  return (
    <section className="domain-details-content">
      <button type="button" className="back-link" onClick={() => navigate("/domains")}>
        <Icon name="arrowLeft" size={16} />
        Back to Domains
      </button>

      {domain && (
        <article className="domain-hero-card">
          <div className="domain-hero-banner">
            {domain.bannerUrl ? (
              <img src={domain.bannerUrl} alt={domain.name} />
            ) : (
              <div className="domain-banner-placeholder">
                <Icon name="compass" size={48} />
              </div>
            )}
          </div>
          <div className="domain-hero-body">
            <div className="domain-hero-header">
              <h1>{domain.name}</h1>
              <span className={`domain-badge ${domain.difficulty?.toLowerCase() ?? "beginner"}`}>
                {domain.difficulty ?? "BEGINNER"}
              </span>
            </div>
            <p>{domain.description}</p>
          </div>
        </article>
      )}

      <div className="topics-section">
        <h2>Domain Topics</h2>

        {topicsLoading ? (
          <LoadingState message="Loading domain topics..." />
        ) : topicsError && topics.length === 0 ? (
          <ErrorState message={topicsError} />
        ) : topics.length > 0 ? (
          <div className="topics-grid">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No topics available"
            message="Topics for this domain are coming soon."
            icon="map"
          />
        )}
      </div>
    </section>
  );
}
