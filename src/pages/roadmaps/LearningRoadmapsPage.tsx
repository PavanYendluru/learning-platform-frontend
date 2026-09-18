import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { RoadmapCard } from "../../components/roadmaps/RoadmapCard";
import { useRoadmaps } from "../../hooks/useRoadmaps";
import "./LearningRoadmapsPage.css";

export function LearningRoadmapsPage() {
  const { roadmaps, loading, usingFallback, error } = useRoadmaps();

  return (
    <section className="roadmaps-content">
      <PageHeader
        title="Learning Roadmaps"
        description="Structured, step-by-step career paths and skill progression guides."
      />

      {usingFallback && (
        <div className="fallback-note">
          Showing preview learning roadmaps while backend is initializing.
        </div>
      )}

      {loading ? (
        <LoadingState message="Fetching learning roadmaps..." />
      ) : error && !usingFallback ? (
        <ErrorState message={error} />
      ) : roadmaps.length > 0 ? (
        <div className="roadmaps-grid">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No roadmaps available"
          message="Learning roadmaps are currently being prepared."
          icon="map"
        />
      )}
    </section>
  );
}
