import { Outlet } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AiTutorWidget } from "../components/ai-tutor/AiTutorWidget";

/** Shared authenticated application chrome. */
export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <AiTutorWidget />
    </AppShell>
  );
}
