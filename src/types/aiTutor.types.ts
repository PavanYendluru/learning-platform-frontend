export type TeachingStyle =
  | "GENERAL"
  | "BEGINNER"
  | "STEP_BY_STEP"
  | "PRACTICAL"
  | "INTERVIEW"
  | "CODE_DEBUG"
  | "SUMMARY";

export type AiMessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ReferencedResource {
  id: number;
  title: string;
  resourceType: string;
  externalUrl: string;
  author?: string;
  difficulty?: string;
  durationMinutes?: number;
  explanation?: string;
}

export interface AiMessage {
  id: number;
  role: AiMessageRole;
  content: string;
  teachingStyle?: TeachingStyle;
  provider?: string;
  suggestedFollowUps: string[];
  referencedResources: ReferencedResource[];
  createdAt: string;
}

export interface AiConversation {
  id: number;
  title: string;
  contextTopicId?: number;
  contextTopicName?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
}

export interface AiStatus {
  configured: boolean;
  model: string;
  primaryProvider?: string;
  primaryModel?: string;
  primaryConfigured?: boolean;
  fallbackProvider?: string;
  fallbackModel?: string;
  fallbackConfigured?: boolean;
  fallbackEnabled?: boolean;
}

// SSE Streaming Events from Backend
export interface AiStreamStartEvent {
  type: "start";
  provider: string;
  model: string;
}

export interface AiStreamChunkEvent {
  type: "chunk";
  text: string;
}

export interface AiStreamProviderSwitchEvent {
  type: "provider_switch";
  from: string;
  to: string;
  reason: string;
}

export interface AiStreamResetEvent {
  type: "reset";
  reason: string;
}

export interface AiStreamCompleteEvent {
  type: "complete";
  messageId?: number;
  provider: string;
  model: string;
  suggestedFollowUps?: string[];
  referencedResources?: ReferencedResource[];
}

export interface AiStreamErrorEvent {
  type: "error";
  message: string;
}

export type AiStreamEvent =
  | AiStreamStartEvent
  | AiStreamChunkEvent
  | AiStreamProviderSwitchEvent
  | AiStreamResetEvent
  | AiStreamCompleteEvent
  | AiStreamErrorEvent;
