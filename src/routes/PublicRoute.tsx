import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function PublicRoute() {
  const { isAuthenticated, status, user } = useAuth();
  if (status === "restoring") return null;

  if (isAuthenticated && user) {
    const home = user.role === "ADMIN" ? "/admin" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}