import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/auth.types";

export function RoleRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { status, user } = useAuth();
  if (status === "restoring") return null;
  return user && allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
