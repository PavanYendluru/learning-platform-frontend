import type { DashboardData } from "../types/dashboard.types";

/** Empty defaults when API is unavailable — no dummy learning data */
export const dashboardFallback: DashboardData = {
  stats: {
    domainsExplored: 0,
    topicsCompleted: 0,
    resourcesSaved: 0,
    averageProgress: 0,
  },
  currentCourse: {
    id: 0,
    domain: "",
    topic: "",
    title: "No active learning",
    description: "Start exploring domains and topics to track your progress here.",
    progress: 0,
    category: "",
  },
  ongoingCourses: [],
};
