import { useEffect, useState } from "react";
import { domainApi } from "../api/domainApi";
import type { Domain } from "../types/dashboard.types";

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    domainApi
      .getDomains()
      .then((data) => {
        if (active) {
          setDomains(Array.isArray(data) ? data : []);
          setUsingFallback(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setDomains([]);
          setUsingFallback(false);
          setError(err instanceof Error ? err.message : "Failed to load domains");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { domains, loading, usingFallback, error };
}
