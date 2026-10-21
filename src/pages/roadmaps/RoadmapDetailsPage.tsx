import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { roadmapApi, type BackendRoadmap } from "../../api/roadmapApi";
import { fallbackRoadmaps } from "../../api/roadmapFallback";
import { apiClient } from "../../api/apiClient";
import type { ApiResponse } from "../../types/auth.types";
import type { BackendProgressItem } from "../../api/dashboardApi";
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
  const [userProgress, setUserProgress] = useState<BackendProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      roadmapApi.getRoadmapById(roadmapId),
      apiClient<ApiResponse<BackendProgressItem[]>>("/users/progress"),
    ]).then(([roadmapRes, progRes]) => {
      if (!active) return;
      if (roadmapRes.status === "fulfilled" && roadmapRes.value) {
        setRoadmap(roadmapRes.value);
      }
      if (progRes.status === "fulfilled" && progRes.value?.success && Array.isArray(progRes.value.data)) {
        setUserProgress(progRes.value.data);
      }
      setLoading(false);
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
              <button
                type="button"
                onClick={() => roadmap.domainId && navigate(`/domains/${roadmap.domainId}`)}
                className="roadmap-domain-tag"
                style={{
                  marginBottom: "0.5rem",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: roadmap.domainId ? "pointer" : "default",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span>Domain: {roadmap.domainName}</span>
                {roadmap.domainId && <Icon name="chevronRight" size={12} />}
              </button>
            )}
            <h1 style={{ font: "800 clamp(1.4rem, 2.2vw, 1.9rem) / 1.25 var(--font-display)", margin: "0 0 0.6rem", color: "var(--color-ink)" }}>
              {roadmap.title}
            </h1>
            <p style={{ fontSize: "var(--text-md)", color: "var(--color-muted)", margin: 0, lineHeight: 1.5, maxWidth: "48rem" }}>
              {roadmap.description}
            </p>
          </article>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
            <h2 style={{ font: "800 var(--text-xl) / 1.2 var(--font-display)", margin: 0, color: "var(--color-ink)" }}>
              Learning Path Stages ({roadmap.steps?.length ?? 0})
            </h2>
            {roadmap.domainId && (
              <Button variant="ghost" onClick={() => navigate(`/domains/${roadmap.domainId}`)} style={{ fontSize: "var(--text-xs)" }}>
                <Icon name="compass" size={14} />
                Explore All Domain Topics
              </Button>
            )}
          </div>

          <div className="roadmap-timeline">
            {roadmap.steps?.map((step) => {
              const topicProg = userProgress.find((p) => p.topicId === step.topicId);
              const isCompleted = topicProg?.completed ?? false;

              return (
                <article key={step.id} className="roadmap-step-card">
                  <div
                    className="step-order-circle"
                    style={isCompleted ? { background: "#10b981", color: "#fff" } : undefined}
                  >
                    {isCompleted ? "✓" : step.stepOrder}
                  </div>
                  <div className="step-content">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <h3 style={{ margin: 0 }}>{step.title}</h3>
                      {step.topicId && (
                        <span className={`status-pill ${isCompleted ? "completed" : topicProg ? "in-progress" : "user"}`}>
                          {isCompleted ? "Completed ✓" : topicProg ? `${topicProg.progressPercentage}% Completed` : "Not Started"}
                        </span>
                      )}
                    </div>

                    <p>{step.description}</p>

                    {step.topicId && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/domains/${roadmap.domainId ?? 1}/topics/${step.topicId}`)}
                          style={{
                            padding: "0.3rem 0.65rem",
                            fontSize: "var(--text-xs)",
                            color: "var(--color-primary)",
                            borderColor: "var(--color-line)",
                          }}
                        >
                          Explore Topic ({step.topicName ?? `Topic #${step.topicId}`})
                          <Icon name="chevronRight" size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
