import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../api/apiClient";
import type { ApiResponse } from "../../types/auth.types";
import type { BackendProgressItem } from "../../api/dashboardApi";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import "./ProgressPage.css";

export function ProgressPage() {
  const [progressItems, setProgressItems] = useState<BackendProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    apiClient<ApiResponse<BackendProgressItem[]>>("/users/progress")
      .then((res) => {
        if (active && res.success && res.data) {
          setProgressItems(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setProgressItems([]);
          setUsingFallback(false);
          setError(err instanceof Error ? err.message : "Failed to load progress");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = progressItems.length;
    const completed = progressItems.filter((p) => p.completed).length;
    const inProgress = total - completed;
    const totalPct = progressItems.reduce((acc, p) => acc + (p.progressPercentage || 0), 0);
    const avgPct = total > 0 ? Math.round(totalPct / total) : 0;
    return { total, completed, inProgress, avgPct };
  }, [progressItems]);

  return (
    <section className="progress-content">
      <PageHeader
        title="Learning Progress"
        description="Comprehensive breakdown of topic completion rates, active study goals, and achievements."
      />

      {usingFallback && (
        <div className="fallback-note">
          Showing preview progress data while backend is initializing.
        </div>
      )}

      <div className="progress-summary-grid">
        <div className="progress-summary-card">
          <div className="progress-summary-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--color-primary)" }}>
            <Icon name="trend" size={24} />
          </div>
          <div>
            <strong>{stats.avgPct}%</strong>
            <span>Overall Completion Rate</span>
          </div>
        </div>

        <div className="progress-summary-card">
          <div className="progress-summary-icon" style={{ background: "rgba(21, 186, 136, 0.15)", color: "#15ba88" }}>
            <Icon name="check" size={24} />
          </div>
          <div>
            <strong>{stats.completed}</strong>
            <span>Topics Completed</span>
          </div>
        </div>

        <div className="progress-summary-card">
          <div className="progress-summary-icon" style={{ background: "rgba(235, 144, 10, 0.15)", color: "#eb900a" }}>
            <Icon name="cap" size={24} />
          </div>
          <div>
            <strong>{stats.inProgress}</strong>
            <span>Topics In Progress</span>
          </div>
        </div>
      </div>

      <div className="progress-detail-section">
        <h2>Topic Progress Breakdown</h2>

        {loading ? (
          <LoadingState message="Calculating your progress metrics..." />
        ) : error && !usingFallback ? (
          <ErrorState message={error} />
        ) : progressItems.length > 0 ? (
          <div className="progress-list">
            {progressItems.map((item) => (
              <article key={item.id} className="progress-item-card">
                <div className="progress-item-header">
                  <h3>{item.topicName}</h3>
                  <span className={`status-pill ${item.completed ? "completed" : "in-progress"}`}>
                    {item.completed ? "Completed" : `${item.progressPercentage}% Completed`}
                  </span>
                </div>

                <div className="progress-track" style={{ marginTop: "0.5rem" }}>
                  <span className="progress-fill" style={{ width: `${item.progressPercentage}%` }} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No progress data"
            message="Start exploring domains and topics to track your learning progress."
            icon="progress"
          />
        )}
      </div>
    </section>
  );
}
