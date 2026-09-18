import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth.types";
import type {
  DashboardData,
  Domain,
  LearningResource,
  Topic,
} from "../types/dashboard.types";

export interface BackendProgressItem {
  id: number;
  topicId: number;
  topicName: string;
  completed: boolean;
  progressPercentage: number;
  completedAt?: string;
  updatedAt?: string;
}

export interface BackendBookmarkItem {
  id: number;
  resourceId: number;
  resourceTitle: string;
  resourceType: string;
  externalUrl?: string;
  createdAt?: string;
}

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    // Attempt dedicated dashboard stats or aggregate from user progress & bookmarks
    try {
      const response = await apiClient<ApiResponse<DashboardData>>("/progress/dashboard");
      if (response.success && response.data) return response.data;
    } catch {
      // Fallback to aggregating user progress, bookmarks, and domains
    }

    const [progressRes, bookmarksRes, domainsRes] = await Promise.allSettled([
      apiClient<ApiResponse<BackendProgressItem[]>>("/users/progress"),
      apiClient<ApiResponse<BackendBookmarkItem[]>>("/users/bookmarks"),
      apiClient<ApiResponse<Domain[]>>("/domains"),
    ]);

    const progress = progressRes.status === "fulfilled" && progressRes.value.success ? progressRes.value.data : [];
    const bookmarks = bookmarksRes.status === "fulfilled" && bookmarksRes.value.success ? bookmarksRes.value.data : [];
    const domainsRaw = domainsRes.status === "fulfilled" ? domainsRes.value : null;
    const domains: Domain[] =
      domainsRaw && Array.isArray((domainsRaw as any).data)
        ? (domainsRaw as any).data
        : Array.isArray(domainsRaw)
          ? (domainsRaw as Domain[])
          : [];

    const topicsCompleted = progress.filter((p) => p.completed).length;
    const resourcesSaved = bookmarks.length;

    const totalPct = progress.reduce((acc, p) => acc + (p.progressPercentage || 0), 0);
    const averageProgress = progress.length > 0 ? Math.round(totalPct / progress.length) : 0;

    const domainsExplored = progress.length > 0
      ? Math.min(progress.length, domains.length > 0 ? domains.length : progress.length)
      : 0;

    const ongoingCourses = progress.map((p) => ({
      id: p.topicId,
      domain: "Learning Domain",
      topic: p.topicName,
      title: p.topicName,
      description: p.completed ? "Completed topic" : `In progress (${p.progressPercentage}%)`,
      progress: p.progressPercentage || 0,
      category: p.completed ? "Completed" : "In Progress",
    }));

    const current = ongoingCourses[0] ?? {
      id: 0,
      domain: "",
      topic: "",
      title: "No active learning",
      description: "Start exploring domains and mark topics as in progress to see them here.",
      progress: 0,
      category: "",
    };

    return {
      stats: {
        domainsExplored,
        topicsCompleted,
        resourcesSaved,
        averageProgress,
      },
      currentCourse: current,
      ongoingCourses,
    };
  },

  getDomains: () => apiClient<Domain[]>("/domains"),
  getTopics: (domainId: number) => apiClient<Topic[]>(`/domains/${domainId}/topics`),
  getResources: () => apiClient<ApiResponse<LearningResource[]>>("/resources"),
  getBookmarks: () => apiClient<ApiResponse<BackendBookmarkItem[]>>("/users/bookmarks"),
  addBookmark: (resourceId: number) =>
    apiClient<ApiResponse<BackendBookmarkItem>>(`/users/bookmarks/${resourceId}`, {
      method: "POST",
    }),
  removeBookmark: (resourceId: number) =>
    apiClient<ApiResponse<void>>(`/users/bookmarks/${resourceId}`, {
      method: "DELETE",
    }),
};