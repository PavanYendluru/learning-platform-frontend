import type { Role } from "./auth.types";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface UserProgressSummary {
  domainsExplored: number;
  topicsCompleted: number;
  resourcesCompleted: number;
  resourcesSaved: number;
}

export interface UserStartedDomain {
  id: number;
  name: string;
  progressPercentage: number;
}

export interface UserStartedTopic {
  id: number;
  name: string;
  domainName: string;
  completed: boolean;
  progressPercentage: number;
}

export interface UserCompletedResource {
  id: number;
  title: string;
  resourceType: string;
  completedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastActiveAt?: string;
  summary?: UserProgressSummary;
  startedDomains?: UserStartedDomain[];
  startedTopics?: UserStartedTopic[];
  completedResources?: UserCompletedResource[];
}
