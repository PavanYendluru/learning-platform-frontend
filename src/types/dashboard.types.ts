export interface CourseProgress {
  id: number;
  domain: string;
  topic: string;
  title: string;
  description: string;
  progress: number;
  thumbnailUrl?: string;
  category: string;
}

export interface DashboardStats {
  domainsExplored: number;
  topicsCompleted: number;
  resourcesSaved: number;
  averageProgress: number;
}

export interface DashboardData {
  stats: DashboardStats;
  currentCourse: CourseProgress;
  ongoingCourses: CourseProgress[];
}

export interface Domain {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  difficulty?: string;
  status?: string;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  description?: string;
  domainId?: number;
  domainName?: string;
  sequenceNumber?: number;
  difficulty?: string;
  status?: string;
  resourcesCount?: number;
}

export type ResourceType =
  | "VIDEO"
  | "BOOK"
  | "DOCUMENTATION"
  | "RESEARCH_PAPER"
  | "ARTICLE";

export interface LearningResource {
  id: number;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url: string;
  thumbnailUrl?: string;
  domainId?: number;
  topicId?: number;
}

export interface Bookmark {
  id: number;
  resourceId: number;
  createdAt?: string;
}