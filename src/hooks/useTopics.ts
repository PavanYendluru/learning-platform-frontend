import { useEffect, useState } from "react";
import { topicApi, type BackendTopic } from "../api/topicApi";
import { fallbackTopics } from "../api/topicFallback";

export function useTopics(domainId: number) {
  const [topics, setTopics] = useState<BackendTopic[]>(() => fallbackTopics[domainId] ?? []);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainId) return;

    let active = true;

    topicApi
      .getTopicsByDomain(domainId)
      .then((data) => {
        if (active) {
          const items = data.length > 0 ? data : fallbackTopics[domainId] ?? [];
          setTopics(items);
          setUsingFallback(data.length === 0);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setTopics(fallbackTopics[domainId] ?? []);
          setUsingFallback(true);
          setError(err instanceof Error ? err.message : "Failed to load domain topics");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [domainId]);

  return { topics, loading, usingFallback, error };
}
