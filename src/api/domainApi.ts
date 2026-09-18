import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth.types";
import type { Domain } from "../types/dashboard.types";

export const domainApi = {
  getDomains: async (): Promise<Domain[]> => {
    const response = await apiClient<ApiResponse<Domain[]>>("/domains");
    return response.data ?? [];
  },

  getDomainById: async (domainId: number): Promise<Domain> => {
    const response = await apiClient<ApiResponse<Domain>>(`/domains/${domainId}`);
    return response.data;
  },
};
