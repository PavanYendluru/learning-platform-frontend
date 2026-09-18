import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth.types";

export type ResourceType =
  | "VIDEO"
  | "BOOK"
  | "DOCUMENTATION"
  | "RESEARCH_PAPER"
  | "ARTICLE"
  | "COURSE"
  | "GITHUB"
  | "PRACTICE"
  | "PROJECT"
  | "TECHNOLOGY_UPDATE";

export interface BackendResource {
  id: number;
  topicId?: number;
  title: string;
  description?: string;
  resourceType: ResourceType;
  externalUrl: string;
  youtubeContentType?: "VIDEO" | "PLAYLIST" | "FULL_COURSE";
  thumbnailUrl?: string;
  author?: string;
  publisher?: string;
  sourceName?: string;
  difficulty?: string;
  durationMinutes?: number;
  language?: string;
  doi?: string;
  status?: string;
  createdAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ResourceSearchParams {
  page?: number;
  size?: number;
  topicId?: number;
  resourceType?: ResourceType;
  difficulty?: string;
  q?: string;
}

export const resourceApi = {
  searchResources: async (params?: ResourceSearchParams): Promise<PagedResponse<BackendResource>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));
    if (params?.topicId) query.set("topicId", String(params.topicId));
    if (params?.resourceType) query.set("resourceType", params.resourceType);
    if (params?.difficulty) query.set("difficulty", params.difficulty);
    if (params?.q) query.set("q", params.q);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await apiClient<ApiResponse<PagedResponse<BackendResource>>>(`/resources${queryString}`);
    return response.data;
  },

  getResourceById: async (id: number): Promise<BackendResource> => {
    const response = await apiClient<ApiResponse<BackendResource>>(`/resources/${id}`);
    return response.data;
  },
};
