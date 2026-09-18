import { useNavigate } from "react-router-dom";
import type { BackendRoadmap } from "../../api/roadmapApi";
import { Icon } from "../layout/Icon";

export function RoadmapCard({ roadmap }: { roadmap: BackendRoadmap }) {
  const navigate = useNavigate();

  return (
    <article
      className="roadmap-card card"
      onClick={() => navigate(`/roadmaps/${roadmap.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/roadmaps/${roadmap.id}`);
        }
      }}
    >
      <div className="roadmap-card-header">
        <div className="roadmap-icon-wrapper">
          <Icon name="map" size={22} />
        </div>
        <div>
          {roadmap.domainName && <span className="roadmap-domain-tag">{roadmap.domainName}</span>}
          <h3>{roadmap.title}</h3>
        </div>
      </div>

      <p>{roadmap.description}</p>

      <div className="roadmap-card-footer">
        <span className="steps-count-tag">
          <Icon name="check" size={14} />
          {roadmap.steps?.length ?? 0} Learning Stages
        </span>
        <span className="view-roadmap-btn">
          View Roadmap
          <Icon name="chevronRight" size={16} />
        </span>
      </div>
    </article>
  );
}
