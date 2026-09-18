import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/apiClient";
import type { ApiResponse } from "../../types/auth.types";
import type { BackendProgressItem } from "../../api/dashboardApi";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Icon } from "../../components/layout/Icon";
import "./MyLearningPage.css";

type Tab = "ALL" | "IN_PROGRESS" | "COMPLETED";

export function MyLearningPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("ALL");
  const [progressItems, setProgressItems] = useState<BackendProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient<ApiResponse<BackendProgressItem[]>>("/users/progress")
      .then((res) => {
        if (active && res.success && res.data) {
          setProgressItems(res.data);
        }
      })
      .catch(() => {
        if (active) {
          setProgressItems([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const continueItem = useMemo(
    () => progressItems.find((item) => !item.completed) ?? progressItems[0],
    [progressItems]
  );

  const filteredItems = useMemo(() => {
    if (activeTab === "IN_PROGRESS") return progressItems.filter((i) => !i.completed);
    if (activeTab === "COMPLETED") return progressItems.filter((i) => i.completed);
    return progressItems;
  }, [activeTab, progressItems]);

  return (
    <section className="my-learning-content">
      <PageHeader
        title="My Learning"
        description="Track your enrolled topics, monitor completion rates, and resume your learning."
      />

      {continueItem && (
        <article className="card" style={{ padding: "1.5rem", margin: "1.25rem 0 1.75rem", background: "var(--color-surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <span className="status-pill in-progress" style={{ marginBottom: "0.5rem", display: "inline-block" }}>
                Active Plan
              </span>
              <h2 style={{ font: "800 1.35rem/1.2 var(--font-display)", margin: "0 0 0.35rem", color: "var(--color-ink)" }}>
                {continueItem.topicName}
              </h2>
              <p style={{ color: "var(--color-muted)", margin: 0, fontSize: "var(--text-sm)" }}>
                Current progress: {continueItem.progressPercentage}%
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate(`/domains`)}>
              <Icon name="play" size={16} />
              Resume Learning
            </Button>
          </div>
        </article>
      )}

      <div className="my-learning-tabs" role="tablist" aria-label="Filter learning status">
        <button
          type="button"
          className={`tab-btn ${activeTab === "ALL" ? "active" : ""}`}
          onClick={() => setActiveTab("ALL")}
        >
          All Topics ({progressItems.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "IN_PROGRESS" ? "active" : ""}`}
          onClick={() => setActiveTab("IN_PROGRESS")}
        >
          In Progress ({progressItems.filter((i) => !i.completed).length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "COMPLETED" ? "active" : ""}`}
          onClick={() => setActiveTab("COMPLETED")}
        >
          Completed ({progressItems.filter((i) => i.completed).length})
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading your progress..." />
      ) : filteredItems.length > 0 ? (
        <div className="progress-cards-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="learning-progress-card card">
              <div className="learning-progress-header">
                <h3>{item.topicName}</h3>
                <span className={`status-pill ${item.completed ? "completed" : "in-progress"}`}>
                  {item.completed ? "Completed" : "In Progress"}
                </span>
              </div>

              <div className="progress-info">
                <div className="progress-info-row">
                  <span>Progress</span>
                  <strong>{item.progressPercentage}%</strong>
                </div>
                <div className="progress-track">
                  <span className="progress-fill" style={{ width: `${item.progressPercentage}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No topics found"
          message={
            activeTab === "COMPLETED"
              ? "You haven't completed any topics yet. Keep learning!"
              : "No topics match this view."
          }
          icon="cap"
        />
      )}
    </section>
  );
}
