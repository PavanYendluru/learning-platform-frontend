import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth.types";

export interface BackendTopic {
  id: number;
  domainId: number;
  name: string;
  slug: string;
  description?: string;
  sequenceNumber?: number;
  difficulty?: string;
  status?: string;
}

export const topicApi = {
  getTopicsByDomain: async (domainId: number): Promise<BackendTopic[]> => {
    const response = await apiClient<ApiResponse<BackendTopic[]>>(`/domains/${domainId}/topics`);
    return response.data ?? [];
  },

  getTopicById: async (topicId: number): Promise<BackendTopic> => {
    const response = await apiClient<ApiResponse<BackendTopic>>(`/topics/${topicId}`);
    return response.data;
  },
};
