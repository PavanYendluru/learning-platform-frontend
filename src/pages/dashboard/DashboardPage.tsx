import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../components/dashboard/StatCard";
import { ContinueLearningCard } from "../../components/dashboard/ContinueLearningCard";
import { CourseCard } from "../../components/dashboard/CourseCard";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/layout/Icon";
import { useDashboard } from "../../hooks/useDashboard";
import { adminApi, type TechnologyUpdate } from "../../api/adminApi";
import "./DashboardPage.css";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, usingFallback, error } = useDashboard();
  const [techUpdates, setTechUpdates] = useState<TechnologyUpdate[]>([]);

  useEffect(() => {
    adminApi
      .getTechnologyUpdates()
      .then((res) => {
        const published = res.filter((u) => u.status === "PUBLISHED" || !u.status);
        setTechUpdates(published);
      })
      .catch(() => {
        setTechUpdates([]);
      });
  }, []);

  return (
    <section className="dashboard-content">
      <PageHeader
        title="Dashboard"
        description="Pick up right where you left off and achieve your learning goals."
      />

      {usingFallback && (
        <div className="fallback-note">
          Showing local preview data while the dashboard API is offline.
        </div>
      )}

      {error && !usingFallback && <ErrorState message={error} />}

      <div className="dashboard-grid">
        <ContinueLearningCard course={data.currentCourse} />
        <section className="stats-grid">
          <StatCard value={String(data.stats.domainsExplored)} label="Domains Explored" kind="compass" />
          <StatCard value={String(data.stats.topicsCompleted)} label="Topics Completed" kind="check" />
          <StatCard value={String(data.stats.resourcesSaved)} label="Resources Saved" kind="bookmark" />
          <StatCard value={`${data.stats.averageProgress}%`} label="Avg Progress" kind="trend" />
        </section>
      </div>

      {/* Latest Technology Updates Published by Admin */}
      {techUpdates.length > 0 && (
        <section style={{ margin: "2rem 0" }}>
          <div className="section-heading">
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon name="newspaper" size={20} />
              Latest Tech & Domain Updates
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {techUpdates.slice(0, 3).map((up) => (
              <div
                key={up.id}
                style={{
                  background: "var(--color-surface)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-line)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="status-pill in-progress" style={{ fontSize: "var(--text-xs)" }}>
                      {up.updateType.replace(/_/g, " ")}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--color-muted)" }}>
                      {up.technologyVersion}
                    </span>
                  </div>
                  <strong style={{ display: "block", color: "var(--color-ink)", marginBottom: "0.35rem" }}>
                    {up.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-muted)", lineClamp: 2 }}>
                    {up.summary}
                  </p>
                </div>
                {up.sourceUrl && (
                  <a
                    href={up.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      marginTop: "0.75rem",
                      fontSize: "var(--text-xs)",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Read official update <Icon name="externalLink" size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ongoing">
        <div className="section-heading">
          <h2>Other Ongoing Courses</h2>
          <Button variant="ghost" onClick={() => navigate("/my-learning")}>
            View All
          </Button>
        </div>

        {loading ? (
          <LoadingState message="Loading your learning progress..." />
        ) : data.ongoingCourses.length ? (
          <div className="course-grid">
            {data.ongoingCourses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="No ongoing courses yet" message="When you start a topic, it will appear here." icon="cap" />
        )}
      </section>
    </section>
  );
}
