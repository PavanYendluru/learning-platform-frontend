import { useNavigate } from "react-router-dom";
import type { Domain } from "../../types/dashboard.types";
import { Icon } from "../layout/Icon";

export function DomainCard({ domain }: { domain: Domain }) {
  const navigate = useNavigate();

  const difficultyClass = domain.difficulty?.toLowerCase() ?? "beginner";

  return (
    <article
      className="domain-card card"
      onClick={() => navigate(`/domains/${domain.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/domains/${domain.id}`);
        }
      }}
    >
      <div className="domain-card-banner">
        {domain.bannerUrl ? (
          <img src={domain.bannerUrl} alt={domain.name} loading="lazy" />
        ) : (
          <div className="domain-banner-placeholder">
            <Icon name="compass" size={32} />
          </div>
        )}
        <span className={`domain-badge ${difficultyClass}`}>
          {domain.difficulty ?? "BEGINNER"}
        </span>
      </div>

      <div className="domain-card-body">
        <div className="domain-card-header">
          <div className="domain-icon-wrapper">
            <Icon name="compass" size={20} />
          </div>
          <h3>{domain.name}</h3>
        </div>

        <p>{domain.description}</p>

        <div className="domain-card-footer">
          <span className="explore-link">
            Explore Topics
            <Icon name="chevronRight" size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
