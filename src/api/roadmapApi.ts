import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth.types";

export interface BackendRoadmapStep {
  id: number;
  topicId?: number;
  topicName?: string;
  title: string;
  description?: string;
  stepOrder: number;
}

export interface BackendRoadmap {
  id: number;
  title: string;
  description: string;
  domainId?: number;
  domainName?: string;
  status?: string;
  steps: BackendRoadmapStep[];
  createdAt?: string;
  updatedAt?: string;
}

export const roadmapApi = {
  getPublishedRoadmaps: async (): Promise<BackendRoadmap[]> => {
    const response = await apiClient<ApiResponse<BackendRoadmap[]>>("/roadmaps");
    return response.data ?? [];
  },

  getRoadmapById: async (id: number): Promise<BackendRoadmap> => {
    const response = await apiClient<ApiResponse<BackendRoadmap>>(`/roadmaps/${id}`);
    return response.data;
  },
};
