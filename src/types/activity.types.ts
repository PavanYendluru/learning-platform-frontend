export type ActivityType =
  | "RESOURCE_APPROVED"
  | "RESOURCE_REJECTED"
  | "RESOURCE_CREATED"
  | "DOMAIN_CREATED"
  | "TOPIC_CREATED"
  | "USER_ROLE_CHANGED"
  | "USER_STATUS_CHANGED"
  | "ROADMAP_UPDATED"
  | "TECH_UPDATE_PUBLISHED";

export interface ActivityLogItem {
  id: number;
  title: string;
  description: string;
  activityType: ActivityType;
  actorName?: string;
  createdAt: string;
}
