import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { domainApi } from "../../api/domainApi";
import { fallbackDomains } from "../../api/domainFallback";
import { roadmapApi, type BackendRoadmap } from "../../api/roadmapApi";
import { apiClient } from "../../api/apiClient";
import type { ApiResponse } from "../../types/auth.types";
import type { BackendProgressItem, DomainProgressData } from "../../api/dashboardApi";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { Icon } from "../../components/layout/Icon";
import { TopicCard } from "../../components/topics/TopicCard";
import { useTopics } from "../../hooks/useTopics";
import type { Domain } from "../../types/dashboard.types";
import "./DomainDetailsPage.css";

type TabType = "topics" | "roadmap" | "progress";

export function DomainDetailsPage() {
  const navigate = useNavigate();
  const { domainId: domainIdParam } = useParams<{ domainId: string }>();
  const domainId = Number(domainIdParam) || 1;

  const [activeTab, setActiveTab] = useState<TabType>("topics");
  const [domain, setDomain] = useState<Domain | null>(
    () => fallbackDomains.find((d) => d.id === domainId) ?? fallbackDomains[0]
  );
  const [domainLoading, setDomainLoading] = useState(true);

  // Topics
  const { topics, loading: topicsLoading, error: topicsError } = useTopics(domainId);

  // Roadmap for this domain
  const [roadmap, setRoadmap] = useState<BackendRoadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Domain & topic progress
  const [domainProgress, setDomainProgress] = useState<DomainProgressData | null>(null);
  const [userTopicProgress, setUserTopicProgress] = useState<BackendProgressItem[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

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

    // Fetch domain roadmap
    setRoadmapLoading(true);
    roadmapApi
      .getDomainRoadmap(domainId)
      .then((res) => {
        if (active) setRoadmap(res);
      })
      .catch(() => {
        if (active) setRoadmap(null);
      })
      .finally(() => {
        if (active) setRoadmapLoading(false);
      });

    // Fetch user progress for domain & topics
    setProgressLoading(true);
    Promise.allSettled([
      apiClient<ApiResponse<DomainProgressData>>(`/users/progress/domain/${domainId}`),
      apiClient<ApiResponse<BackendProgressItem[]>>("/users/progress"),
    ]).then(([dProgRes, tProgRes]) => {
      if (!active) return;
      if (dProgRes.status === "fulfilled" && dProgRes.value?.success && dProgRes.value.data) {
        setDomainProgress(dProgRes.value.data);
      }
      if (tProgRes.status === "fulfilled" && tProgRes.value?.success && Array.isArray(tProgRes.value.data)) {
        setUserTopicProgress(tProgRes.value.data);
      }
      setProgressLoading(false);
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
              <div>
                <h1>{domain.name}</h1>
                <span className={`domain-badge ${domain.difficulty?.toLowerCase() ?? "beginner"}`} style={{ marginTop: "0.4rem" }}>
                  {domain.difficulty ?? "BEGINNER"}
                </span>
              </div>

              {/* Action shortcuts */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Button
                  variant={activeTab === "roadmap" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("roadmap")}
                  style={{ fontSize: "var(--text-xs)", padding: "0.4rem 0.75rem" }}
                >
                  <Icon name="map" size={16} />
                  {roadmap ? "Explore Roadmap" : "View Roadmap"}
                </Button>
                <Button
                  variant={activeTab === "progress" ? "primary" : "ghost"}
                  onClick={() => setActiveTab("progress")}
                  style={{ fontSize: "var(--text-xs)", padding: "0.4rem 0.75rem" }}
                >
                  <Icon name="progress" size={16} />
                  My Progress ({domainProgress?.progressPercentage ?? 0}%)
                </Button>
              </div>
            </div>
            <p>{domain.description}</p>
          </div>
        </article>
      )}

      {/* Segmented Tab Navigation */}
      <div className="domain-tabs-nav" style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--color-line)", marginBottom: "1.5rem" }}>
        <button
          type="button"
          className={`domain-tab-btn ${activeTab === "topics" ? "active" : ""}`}
          onClick={() => setActiveTab("topics")}
        >
          <Icon name="files" size={16} />
          <span>Curated Topics</span>
          <span className="domain-tab-badge">{topics.length}</span>
        </button>

        <button
          type="button"
          className={`domain-tab-btn ${activeTab === "roadmap" ? "active" : ""}`}
          onClick={() => setActiveTab("roadmap")}
        >
          <Icon name="map" size={16} />
          <span>Learning Roadmap</span>
          {roadmap?.steps && roadmap.steps.length > 0 && (
            <span className="domain-tab-badge">{roadmap.steps.length} Steps</span>
          )}
        </button>

        <button
          type="button"
          className={`domain-tab-btn ${activeTab === "progress" ? "active" : ""}`}
          onClick={() => setActiveTab("progress")}
        >
          <Icon name="progress" size={16} />
          <span>Domain Progress</span>
          {domainProgress && (
            <span className="domain-tab-badge">{domainProgress.progressPercentage}%</span>
          )}
        </button>
      </div>

      {/* Tab 1: Topics Grid */}
      {activeTab === "topics" && (
        <div className="topics-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>All Domain Topics ({topics.length})</h2>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
              Organized by difficulty and sequence
            </span>
          </div>

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
      )}

      {/* Tab 2: Roadmap Ordered Steps */}
      {activeTab === "roadmap" && (
        <div className="roadmap-tab-section">
          {roadmapLoading ? (
            <LoadingState message="Loading domain roadmap..." />
          ) : roadmap ? (
            <div>
              <article className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", background: "var(--color-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h2 style={{ margin: 0, font: "800 var(--text-xl) / 1.2 var(--font-display)", color: "var(--color-ink)" }}>
                    {roadmap.title}
                  </h2>
                  <span className="status-pill in-progress">{roadmap.steps?.length ?? 0} Ordered Steps</span>
                </div>
                <p style={{ margin: "0.5rem 0 0", color: "var(--color-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5, maxWidth: "48rem" }}>
                  {roadmap.description}
                </p>
              </article>

              <div className="roadmap-timeline">
                {roadmap.steps?.map((step) => {
                  const topicProg = userTopicProgress.find((p) => p.topicId === step.topicId);
                  const isCompleted = topicProg?.completed ?? false;

                  return (
                    <article key={step.id} className="roadmap-step-card">
                      <div className="step-order-circle" style={isCompleted ? { background: "#10b981", color: "#fff" } : undefined}>
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
                              onClick={() => navigate(`/domains/${domainId}/topics/${step.topicId}`)}
                              style={{
                                padding: "0.3rem 0.65rem",
                                fontSize: "var(--text-xs)",
                                color: "var(--color-primary)",
                                borderColor: "var(--color-line)",
                              }}
                            >
                              Explore Topic: {step.topicName ?? `Topic #${step.topicId}`}
                              <Icon name="chevronRight" size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Learning Roadmap Published"
              message="An ordered roadmap hasn't been created for this domain yet. You can still study all topics freely using the Topics tab."
              icon="map"
            />
          )}
        </div>
      )}

      {/* Tab 3: Progress Breakdown */}
      {activeTab === "progress" && (
        <div className="progress-tab-section">
          {progressLoading ? (
            <LoadingState message="Calculating domain learning progress..." />
          ) : (
            <div>
              {/* Domain Summary Cards */}
              <div className="domain-progress-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
                <div className="card" style={{ padding: "1.25rem", background: "var(--color-surface)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Overall Completion
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.35rem 0" }}>
                    <span style={{ font: "800 clamp(1.8rem, 2.5vw, 2.4rem) / 1 var(--font-display)", color: "var(--color-primary)" }}>
                      {domainProgress?.progressPercentage ?? 0}%
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: "6px" }}>
                    <span className="progress-fill" style={{ width: `${domainProgress?.progressPercentage ?? 0}%` }} />
                  </div>
                </div>

                <div className="card" style={{ padding: "1.25rem", background: "var(--color-surface)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Topics Completed
                  </span>
                  <div style={{ margin: "0.35rem 0" }}>
                    <strong style={{ font: "800 clamp(1.6rem, 2.2vw, 2rem) / 1 var(--font-display)", color: "var(--color-ink)" }}>
                      {domainProgress?.completedTopics ?? 0}
                    </strong>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", marginLeft: "0.35rem" }}>
                      of {domainProgress?.totalTopics ?? topics.length}
                    </span>
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "#10b981", fontWeight: 700 }}>
                    {domainProgress && domainProgress.totalTopics > 0
                      ? `${Math.round((domainProgress.completedTopics / domainProgress.totalTopics) * 100)}% of topics finished`
                      : "0% completed"}
                  </span>
                </div>

                <div className="card" style={{ padding: "1.25rem", background: "var(--color-surface)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    Resources Completed
                  </span>
                  <div style={{ margin: "0.35rem 0" }}>
                    <strong style={{ font: "800 clamp(1.6rem, 2.2vw, 2rem) / 1 var(--font-display)", color: "var(--color-ink)" }}>
                      {domainProgress?.completedResources ?? 0}
                    </strong>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--color-muted)", marginLeft: "0.35rem" }}>
                      of {domainProgress?.totalResources ?? 0}
                    </span>
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
                    Videos, articles & practice guides
                  </span>
                </div>
              </div>

              {/* Topic-by-Topic Breakdown */}
              <h3 style={{ font: "800 var(--text-lg) / 1.2 var(--font-display)", margin: "0 0 1rem", color: "var(--color-ink)" }}>
                Topic Mastery Breakdown
              </h3>

              {topics.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {topics.map((t) => {
                    const prog = userTopicProgress.find((p) => p.topicId === t.id);
                    const pct = prog?.progressPercentage ?? 0;
                    const isDone = prog?.completed ?? false;

                    return (
                      <div
                        key={t.id}
                        className="card"
                        onClick={() => navigate(`/domains/${domainId}/topics/${t.id}`)}
                        style={{
                          padding: "1rem 1.25rem",
                          background: "var(--color-surface)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "1rem",
                          flexWrap: "wrap",
                          transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: "14rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <span className="sequence-badge">Stage #{t.sequenceNumber ?? 1}</span>
                            <strong style={{ fontSize: "var(--text-sm)", color: "var(--color-ink)" }}>{t.name}</strong>
                          </div>
                          <div className="progress-track" style={{ height: "6px", maxWidth: "20rem" }}>
                            <span className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span className={`status-pill ${isDone ? "completed" : pct > 0 ? "in-progress" : "user"}`}>
                            {isDone ? "Completed ✓" : `${pct}%`}
                          </span>
                          <Button variant="ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "var(--text-xs)" }}>
                            Open Topic
                            <Icon name="chevronRight" size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No topics tracked"
                  message="Topic metrics will display here as learning content is published."
                  icon="progress"
                />
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
