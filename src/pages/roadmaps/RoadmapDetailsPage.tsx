import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roadmapApi, type BackendRoadmap } from "../../api/roadmapApi";
import { fallbackRoadmaps } from "../../api/roadmapFallback";
import { Button } from "../../components/common/Button";
import { LoadingState } from "../../components/common/LoadingState";
import { Icon } from "../../components/layout/Icon";
import "./LearningRoadmapsPage.css";

export function RoadmapDetailsPage() {
  const navigate = useNavigate();
  const { roadmapId: idParam } = useParams<{ roadmapId: string }>();
  const roadmapId = Number(idParam) || 1;

  const [roadmap, setRoadmap] = useState<BackendRoadmap | null>(
    () => fallbackRoadmaps.find((r) => r.id === roadmapId) ?? fallbackRoadmaps[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    roadmapApi
      .getRoadmapById(roadmapId)
      .then((data) => {
        if (active && data) setRoadmap(data);
      })
      .catch(() => {
        // Retain fallback if offline
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roadmapId]);

  if (loading && !roadmap) {
    return (
      <section className="roadmaps-content">
        <LoadingState message="Loading roadmap details..." />
      </section>
    );
  }

  return (
    <section className="roadmaps-content">
      <button type="button" className="back-link" onClick={() => navigate("/roadmaps")}>
        <Icon name="arrowLeft" size={16} />
        Back to Roadmaps
      </button>

      {roadmap && (
        <>
          <article className="card" style={{ padding: "1.75rem", margin: "1.25rem 0 2rem", background: "var(--color-surface)" }}>
            {roadmap.domainName && (
              <span className="roadmap-domain-tag" style={{ marginBottom: "0.5rem" }}>
                {roadmap.domainName}
              </span>
            )}
            <h1 style={{ font: "800 clamp(1.4rem, 2.2vw, 1.9rem) / 1.25 var(--font-display)", margin: "0 0 0.6rem", color: "var(--color-ink)" }}>
              {roadmap.title}
            </h1>
            <p style={{ fontSize: "var(--text-md)", color: "var(--color-muted)", margin: 0, lineHeight: 1.5, maxWidth: "48rem" }}>
              {roadmap.description}
            </p>
          </article>

          <h2 style={{ font: "800 var(--text-xl) / 1.2 var(--font-display)", margin: "0 0 1rem", color: "var(--color-ink)" }}>
            Learning Path Stages ({roadmap.steps?.length ?? 0})
          </h2>

          <div className="roadmap-timeline">
            {roadmap.steps?.map((step) => (
              <article key={step.id} className="roadmap-step-card">
                <div className="step-order-circle">{step.stepOrder}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {step.topicId && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/domains`)}
                    >
                      Explore Topic ({step.topicName ?? `Topic #${step.topicId}`})
                      <Icon name="chevronRight" size={14} />
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
