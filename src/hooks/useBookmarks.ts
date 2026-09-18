import { useCallback, useEffect, useState } from "react";
import { bookmarkApi, type BackendBookmark } from "../api/bookmarkApi";

const fallbackBookmarks: BackendBookmark[] = [
  {
    id: 1,
    resourceId: 1,
    resourceTitle: "Spring Boot 3 Full Course",
    resourceType: "VIDEO",
    externalUrl: "https://www.youtube.com/watch?v=35EQXmHKZYs",
    createdAt: "2026-08-28T10:00:00",
  },
  {
    id: 2,
    resourceId: 2,
    resourceTitle: "Spring Data JPA Documentation & Reference",
    resourceType: "DOCUMENTATION",
    externalUrl: "https://docs.spring.io/spring-data/jpa/reference/index.html",
    createdAt: "2026-08-28T10:30:00",
  },
];

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BackendBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(() => {
    setLoading(true);
    bookmarkApi
      .getMyBookmarks()
      .then((data) => {
        setBookmarks(data);
        setUsingFallback(false);
        setError(null);
      })
      .catch((err: unknown) => {
        setBookmarks(fallbackBookmarks);
        setUsingFallback(true);
        setError(err instanceof Error ? err.message : "Failed to load bookmarks");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const removeBookmark = async (resourceId: number) => {
    try {
      await bookmarkApi.removeBookmark(resourceId);
      setBookmarks((prev) => prev.filter((b) => b.resourceId !== resourceId));
    } catch {
      // Local fallback removal if offline
      setBookmarks((prev) => prev.filter((b) => b.resourceId !== resourceId));
    }
  };

  return { bookmarks, loading, usingFallback, error, removeBookmark, refetch: fetchBookmarks };
}
