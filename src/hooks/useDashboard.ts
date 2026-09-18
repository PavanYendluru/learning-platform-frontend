import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboardApi";
import { dashboardFallback } from "../api/dashboardFallback";
import type { DashboardData } from "../types/dashboard.types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(dashboardFallback);
  const [loading, setLoading] = useState(Boolean(apiBaseUrl));
  const [usingFallback, setUsingFallback] = useState(!apiBaseUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiBaseUrl) return;

    let active = true;

    dashboardApi
      .getDashboard()
      .then((result) => {
        if (active) {
          setData(result);
          setUsingFallback(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setUsingFallback(true);
          setError(err instanceof Error ? err.message : "Dashboard request failed");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, usingFallback, error };
}