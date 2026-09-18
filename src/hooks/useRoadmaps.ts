import { useEffect, useState } from "react";
import { roadmapApi, type BackendRoadmap } from "../api/roadmapApi";
import { fallbackRoadmaps } from "../api/roadmapFallback";

export function useRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<BackendRoadmap[]>(fallbackRoadmaps);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    roadmapApi
      .getPublishedRoadmaps()
      .then((data) => {
        if (active) {
          const items = data.length > 0 ? data : fallbackRoadmaps;
          setRoadmaps(items);
          setUsingFallback(data.length === 0);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setRoadmaps(fallbackRoadmaps);
          setUsingFallback(true);
          setError(err instanceof Error ? err.message : "Failed to load learning roadmaps");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { roadmaps, loading, usingFallback, error };
}
