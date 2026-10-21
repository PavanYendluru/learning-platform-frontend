import { useEffect, useState } from "react";
import { resourceApi, type BackendResource, type ResourceSearchParams } from "../api/resourceApi";
import { fallbackResources } from "../api/resourceFallback";

export function useResources(params?: ResourceSearchParams) {
  const [resources, setResources] = useState<BackendResource[]>(fallbackResources);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    resourceApi
      .searchResources(params)
      .then((data) => {
        if (active) {
          const items = Array.isArray(data?.content) ? data.content : [];
          setResources(items);
          setUsingFallback(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setResources(fallbackResources);
          setUsingFallback(true);
          setError(err instanceof Error ? err.message : "Failed to load resources");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params?.difficulty, params?.page, params?.q, params?.resourceType, params?.topicId]);

  return { resources, loading, usingFallback, error };
}
