import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth.types";

export interface BackendBookmark {
  id: number;
  resourceId: number;
  resourceTitle: string;
  resourceType: string;
  externalUrl?: string;
  topicId?: number;
  topicName?: string;
  domainId?: number;
  domainName?: string;
  createdAt?: string;
}

export const bookmarkApi = {
  getMyBookmarks: async (): Promise<BackendBookmark[]> => {
    const response = await apiClient<ApiResponse<BackendBookmark[]>>("/users/bookmarks");
    return response.data ?? [];
  },

  addBookmark: async (resourceId: number): Promise<BackendBookmark> => {
    const response = await apiClient<ApiResponse<BackendBookmark>>(`/users/bookmarks/${resourceId}`, {
      method: "POST",
    });
    return response.data;
  },

  removeBookmark: async (resourceId: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/users/bookmarks/${resourceId}`, {
      method: "DELETE",
    });
  },
};
