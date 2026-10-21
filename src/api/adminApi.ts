import { apiClient } from "./apiClient";
import type { ApiResponse, Role } from "../types/auth.types";
import type { Domain } from "../types/dashboard.types";
import type { Topic } from "../types/dashboard.types";
import type { BackendResource, PagedResponse, ResourceType } from "./resourceApi";
import type { BackendRoadmap, BackendRoadmapStep } from "./roadmapApi";
import type { User, UserStatus } from "../types/user.types";
import type { ActivityLogItem } from "../types/activity.types";

export interface AdminStats {
  totalDomains: number;
  totalTopics: number;
  totalResources: number;
  publishedResources: number;
  pendingReviewResources: number;
  totalUsers: number;
  totalRoadmaps: number;
  totalTechnologyUpdates: number;
}

export interface CreateDomainPayload {
  name: string;
  description: string;
  difficulty?: string;
  bannerUrl?: string;
  iconUrl?: string;
  status?: string;
}

export interface CreateTopicPayload {
  name: string;
  description?: string;
  sequenceNumber?: number;
  difficulty?: string;
  status?: string;
}

export interface CreateResourcePayload {
  topicId: number;
  title: string;
  description?: string;
  resourceType: ResourceType;
  externalUrl: string;
  youtubeContentType?: "VIDEO" | "PLAYLIST" | "FULL_COURSE";
  sequenceNumber?: number;
  thumbnailUrl?: string;
  author?: string;
  publisher?: string;
  sourceName?: string;
  difficulty?: string;
  durationMinutes?: number;
  language?: string;
  doi?: string;
  status?: string;
}

export interface CreateRoadmapPayload {
  title: string;
  description: string;
  domainId?: number;
  status?: string;
  steps?: {
    topicId?: number;
    title: string;
    description?: string;
    stepOrder: number;
  }[];
}

export type TechnologyUpdateType =
  | "RELEASE"
  | "SECURITY_UPDATE"
  | "FEATURE"
  | "DEPRECATION"
  | "BREAKING_CHANGE"
  | "ANNOUNCEMENT"
  | "ROADMAP"
  | "COMMUNITY_UPDATE";

export type TechnologyUpdateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface TechnologyUpdate {
  id: number;
  domainId?: number;
  domainName?: string;
  title: string;
  summary?: string;
  content?: string;
  sourceName?: string;
  sourceUrl?: string;
  publishedDate?: string;
  technologyVersion?: string;
  updateType: TechnologyUpdateType;
  externalReference?: string;
  status?: TechnologyUpdateStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTechnologyUpdatePayload {
  domainId?: number;
  title: string;
  summary?: string;
  content?: string;
  sourceName?: string;
  sourceUrl?: string;
  publishedDate?: string;
  technologyVersion?: string;
  updateType: TechnologyUpdateType;
  externalReference?: string;
  status?: TechnologyUpdateStatus;
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminStats> => {
    const response = await apiClient<ApiResponse<AdminStats>>("/admin/dashboard/stats");
    return response.data;
  },

  /* Domain Management */
  getAdminDomains: async (): Promise<Domain[]> => {
    const response = await apiClient<ApiResponse<Domain[]>>("/admin/domains");
    return response.data ?? [];
  },

  createDomain: async (payload: CreateDomainPayload): Promise<Domain> => {
    const response = await apiClient<ApiResponse<Domain>>("/admin/domains", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateDomain: async (id: number, payload: CreateDomainPayload): Promise<Domain> => {
    const response = await apiClient<ApiResponse<Domain>>(`/admin/domains/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  deleteDomain: async (id: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/admin/domains/${id}`, {
      method: "DELETE",
    });
  },

  /* Topic Management */
  getAllAdminTopics: async (): Promise<Topic[]> => {
    const response = await apiClient<ApiResponse<Topic[]>>("/admin/topics");
    return response.data ?? [];
  },

  getAdminTopicsByDomain: async (domainId: number): Promise<Topic[]> => {
    const response = await apiClient<ApiResponse<Topic[]>>(`/admin/domains/${domainId}/topics`);
    return response.data ?? [];
  },

  createTopic: async (domainId: number, payload: CreateTopicPayload): Promise<Topic> => {
    const response = await apiClient<ApiResponse<Topic>>(`/admin/domains/${domainId}/topics`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateTopic: async (id: number, payload: CreateTopicPayload): Promise<Topic> => {
    const response = await apiClient<ApiResponse<Topic>>(`/admin/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  deleteTopic: async (id: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/admin/topics/${id}`, {
      method: "DELETE",
    });
  },

  /* Resource Management */
  getAdminResources: async (status?: string): Promise<PagedResponse<BackendResource>> => {
    const query = status && status !== "ALL" ? `?status=${status}` : "";
    const response = await apiClient<ApiResponse<PagedResponse<BackendResource>>>(`/admin/resources${query}`);
    return response.data;
  },

  createResource: async (payload: CreateResourcePayload): Promise<BackendResource> => {
    const response = await apiClient<ApiResponse<BackendResource>>("/admin/resources", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateResource: async (id: number, payload: CreateResourcePayload): Promise<BackendResource> => {
    const response = await apiClient<ApiResponse<BackendResource>>(`/admin/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  submitResourceForReview: async (id: number): Promise<BackendResource> => {
    const response = await apiClient<ApiResponse<BackendResource>>(`/admin/resources/${id}/submit-for-review`, {
      method: "POST",
    });
    return response.data;
  },

  approveResource: async (id: number): Promise<BackendResource> => {
    const response = await apiClient<ApiResponse<BackendResource>>(`/admin/resources/${id}/approve`, {
      method: "POST",
    });
    return response.data;
  },

  rejectResource: async (id: number): Promise<BackendResource> => {
    const response = await apiClient<ApiResponse<BackendResource>>(`/admin/resources/${id}/reject`, {
      method: "POST",
    });
    return response.data;
  },

  deleteResource: async (id: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/admin/resources/${id}`, {
      method: "DELETE",
    });
  },

  bulkApproveResources: async (ids: number[]): Promise<void> => {
    await Promise.allSettled(ids.map((id) => adminApi.approveResource(id)));
  },

  bulkDeleteResources: async (ids: number[]): Promise<void> => {
    await Promise.allSettled(ids.map((id) => adminApi.deleteResource(id)));
  },

  /* Technology Updates Management */
  getTechnologyUpdates: async (): Promise<TechnologyUpdate[]> => {
    const response = await apiClient<ApiResponse<TechnologyUpdate[]>>("/admin/technology-updates");
    return response.data ?? [];
  },

  createTechnologyUpdate: async (payload: CreateTechnologyUpdatePayload): Promise<TechnologyUpdate> => {
    const response = await apiClient<ApiResponse<TechnologyUpdate>>("/admin/technology-updates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateTechnologyUpdate: async (id: number, payload: CreateTechnologyUpdatePayload): Promise<TechnologyUpdate> => {
    const response = await apiClient<ApiResponse<TechnologyUpdate>>(`/admin/technology-updates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  deleteTechnologyUpdate: async (id: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/admin/technology-updates/${id}`, {
      method: "DELETE",
    });
  },

  /* Roadmap Management */
  getAdminRoadmapByDomain: async (domainId: number): Promise<BackendRoadmap | null> => {
    try {
      const response = await apiClient<ApiResponse<BackendRoadmap>>(`/admin/domains/${domainId}/roadmap`);
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  createOrUpdateDomainRoadmap: async (domainId: number, payload: CreateRoadmapPayload): Promise<BackendRoadmap> => {
    const response = await apiClient<ApiResponse<BackendRoadmap>>(`/admin/domains/${domainId}/roadmap`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  createRoadmap: async (payload: CreateRoadmapPayload): Promise<BackendRoadmap> => {
    const response = await apiClient<ApiResponse<BackendRoadmap>>("/admin/roadmaps", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateRoadmap: async (id: number, payload: CreateRoadmapPayload): Promise<BackendRoadmap> => {
    const response = await apiClient<ApiResponse<BackendRoadmap>>(`/admin/roadmaps/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  deleteRoadmap: async (id: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/admin/roadmaps/${id}`, {
      method: "DELETE",
    });
  },

  addRoadmapStep: async (roadmapId: number, payload: { topicId?: number; title: string; description?: string; stepOrder?: number }): Promise<BackendRoadmapStep> => {
    const response = await apiClient<ApiResponse<BackendRoadmapStep>>(`/admin/roadmaps/${roadmapId}/steps`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateRoadmapStep: async (stepId: number, payload: { topicId?: number; title: string; description?: string; stepOrder?: number }): Promise<BackendRoadmapStep> => {
    const response = await apiClient<ApiResponse<BackendRoadmapStep>>(`/admin/roadmap-steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  deleteRoadmapStep: async (stepId: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/admin/roadmap-steps/${stepId}`, {
      method: "DELETE",
    });
  },

  reorderRoadmapSteps: async (roadmapId: number, stepIds: number[]): Promise<BackendRoadmap> => {
    const response = await apiClient<ApiResponse<BackendRoadmap>>(`/admin/roadmaps/${roadmapId}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ stepIds }),
    });
    return response.data;
  },

  /* User Management */
  getUsers: async (role?: string, status?: string): Promise<User[]> => {
    const query = new URLSearchParams();
    if (role && role !== "ALL") query.set("role", role);
    if (status && status !== "ALL") query.set("status", status);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const response = await apiClient<ApiResponse<User[]>>(`/admin/users${queryString}`);
    return response.data ?? [];
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: number, role: Role): Promise<User> => {
    const response = await apiClient<ApiResponse<User>>(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    return response.data;
  },

  toggleUserStatus: async (id: number, status: UserStatus): Promise<User> => {
    const response = await apiClient<ApiResponse<User>>(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  /* Audit Logs */
  getAuditLogs: async (): Promise<ActivityLogItem[]> => {
    try {
      const response = await apiClient<ApiResponse<ActivityLogItem[]>>("/admin/audit-logs");
      if (response.success && response.data) return response.data;
    } catch {
      // Optional endpoint
    }
    return [];
  },
};
