import { useNavigate } from "react-router-dom";
import type { BackendTopic } from "../../api/topicApi";
import { Icon } from "../layout/Icon";

export function TopicCard({ topic }: { topic: BackendTopic }) {
  const navigate = useNavigate();

  return (
    <article
      className="topic-card card"
      onClick={() => navigate(`/domains/${topic.domainId}/topics/${topic.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/domains/${topic.domainId}/topics/${topic.id}`);
        }
      }}
    >
      <div className="topic-card-header">
        <span className="sequence-badge">#{topic.sequenceNumber ?? 1}</span>
        <h3>{topic.name}</h3>
      </div>
      <p>{topic.description ?? "Explore curated learning resources for this topic."}</p>
      <div className="topic-card-footer">
        <span className="view-resources-btn">
          View Resources
          <Icon name="chevronRight" size={16} />
        </span>
      </div>
    </article>
  );
}
