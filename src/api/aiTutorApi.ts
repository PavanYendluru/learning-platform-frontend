import { apiClient } from "./apiClient";
import { AUTH_TOKEN_STORAGE_KEY } from "../auth/authStorage";
import type { ApiResponse } from "../types/auth.types";
import type { PagedResponse } from "./resourceApi";
import type {
  AiConversation,
  AiMessage,
  AiStatus,
  ReferencedResource,
  TeachingStyle,
} from "../types/aiTutor.types";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export interface SendMessagePayload {
  content: string;
  teachingStyle?: TeachingStyle;
  contextTopicId?: number;
  currentPage?: string;
}

export interface CreateConversationPayload {
  title?: string;
  contextTopicId?: number;
  initialMessage?: SendMessagePayload;
}

export interface StreamMessageCallbacks {
  onStart?: (data: { provider: string; model: string }) => void;
  onChunk: (chunkText: string) => void;
  onProviderSwitch?: (data: { from: string; to: string; reason: string }) => void;
  onReset?: (data: { reason: string }) => void;
  onComplete: (data: {
    messageId?: number;
    provider: string;
    model: string;
    suggestedFollowUps?: string[];
    referencedResources?: ReferencedResource[];
  }) => void;
  onError: (errorMsg: string) => void;
}

export const aiTutorApi = {
  getStatus: async (): Promise<AiStatus> => {
    const res = await apiClient<ApiResponse<AiStatus>>("/ai/status");
    return res.data;
  },

  createConversation: async (payload?: CreateConversationPayload): Promise<AiConversation> => {
    const res = await apiClient<ApiResponse<AiConversation>>("/ai/conversations", {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    });
    return res.data;
  },

  listConversations: async (page = 0, size = 20, search?: string): Promise<PagedResponse<AiConversation>> => {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (search && search.trim()) {
      query.set("search", search.trim());
    }
    const res = await apiClient<ApiResponse<PagedResponse<AiConversation>>>(
      `/ai/conversations?${query.toString()}`
    );
    return res.data;
  },

  getConversation: async (id: number): Promise<AiConversation> => {
    const res = await apiClient<ApiResponse<AiConversation>>(`/ai/conversations/${id}`);
    return res.data;
  },

  updateTitle: async (id: number, title: string): Promise<AiConversation> => {
    const res = await apiClient<ApiResponse<AiConversation>>(`/ai/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
    return res.data;
  },

  deleteConversation: async (id: number): Promise<void> => {
    await apiClient<ApiResponse<void>>(`/ai/conversations/${id}`, {
      method: "DELETE",
    });
  },

  sendMessage: async (conversationId: number, payload: SendMessagePayload): Promise<AiMessage> => {
    const res = await apiClient<ApiResponse<AiMessage>>(
      `/ai/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  streamMessage: async (
    conversationId: number,
    payload: SendMessagePayload,
    callbacks: StreamMessageCallbacks,
    signal?: AbortSignal
  ): Promise<void> => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const endpoint = `${baseUrl}/ai/conversations/${conversationId}/messages/stream`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // User intentionally stopped generation
      }
      callbacks.onError(err.message || "Network connection failed");
      return;
    }

    if (!response.ok) {
      if (response.status === 401) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      const errorJson = await response.json().catch(() => null);
      const msg = errorJson?.message || `Streaming request failed with status ${response.status}`;
      callbacks.onError(msg);
      return;
    }

    if (!response.body) {
      callbacks.onError("No response body received from server");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const block of parts) {
          if (!block.trim()) continue;

          let eventName = "message";
          let dataStr = "";

          const lines = block.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.slice(5).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const parsedData = JSON.parse(dataStr);

            switch (eventName) {
              case "start":
                callbacks.onStart?.(parsedData);
                break;
              case "chunk":
                if (parsedData.text) {
                  callbacks.onChunk(parsedData.text);
                }
                break;
              case "provider_switch":
                callbacks.onProviderSwitch?.(parsedData);
                break;
              case "reset":
                callbacks.onReset?.(parsedData);
                break;
              case "complete":
                callbacks.onComplete(parsedData);
                break;
              case "error":
                callbacks.onError(parsedData.message || "Generation error");
                break;
              default:
                if (parsedData.text) {
                  callbacks.onChunk(parsedData.text);
                }
            }
          } catch {
            // Raw text fallback
            callbacks.onChunk(dataStr);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // User intentionally stopped generation
      }
      callbacks.onError(err.message || "Stream interrupted unexpectedly");
    } finally {
      reader.releaseLock();
    }
  },
};
