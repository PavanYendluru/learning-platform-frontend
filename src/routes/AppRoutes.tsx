import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { PlaceholderPage } from "../pages/common/PlaceholderPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ExploreDomainsPage } from "../pages/domains/ExploreDomainsPage";
import { DomainDetailsPage } from "../pages/domains/DomainDetailsPage";
import { TopicDetailsPage } from "../pages/domains/TopicDetailsPage";
import { ResourcesPage } from "../pages/resources/ResourcesPage";
import { ResourceDetailsPage } from "../pages/resources/ResourceDetailsPage";
import { MyLearningPage } from "../pages/my-learning/MyLearningPage";
import { BookmarksPage } from "../pages/bookmarks/BookmarksPage";
import { ProgressPage } from "../pages/progress/ProgressPage";
import { LearningRoadmapsPage } from "../pages/roadmaps/LearningRoadmapsPage";
import { RoadmapDetailsPage } from "../pages/roadmaps/RoadmapDetailsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminDomainsPage } from "../pages/admin/AdminDomainsPage";
import { AdminTopicsPage } from "../pages/admin/AdminTopicsPage";
import { AdminResourcesPage } from "../pages/admin/AdminResourcesPage";
import { AdminRoadmapsPage } from "../pages/admin/AdminRoadmapsPage";
import { AdminTechnologyUpdatesPage } from "../pages/admin/AdminTechnologyUpdatesPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { RoleRoute } from "./RoleRoute";

const placeholder = (title: string, description: string) => (
  <PlaceholderPage title={title} description={description} />
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* USER-only learning app */}
          <Route element={<RoleRoute allowedRoles={["USER"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/domains" element={<ExploreDomainsPage />} />
            <Route path="/domains/:domainId" element={<DomainDetailsPage />} />
            <Route path="/domains/:domainId/topics/:topicId" element={<TopicDetailsPage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:resourceId" element={<ResourceDetailsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/roadmaps" element={<LearningRoadmapsPage />} />
            <Route path="/roadmaps/:roadmapId" element={<RoadmapDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* ADMIN-only */}
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/domains" element={<AdminDomainsPage />} />
            <Route path="/admin/topics" element={<AdminTopicsPage />} />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
            <Route path="/admin/roadmaps" element={<AdminRoadmapsPage />} />
            <Route path="/admin/technology-updates" element={<AdminTechnologyUpdatesPage />} />
          </Route>

          <Route path="/unauthorized" element={placeholder("Unauthorized", "You do not have permission to view this page.")} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}