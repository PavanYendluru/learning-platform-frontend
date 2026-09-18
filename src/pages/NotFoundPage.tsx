import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Icon } from "../components/layout/Icon";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
      <div className="state-icon" style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "var(--color-primary-soft)", color: "var(--color-primary)", display: "grid", placeItems: "center", marginBottom: "1rem" }}>
        <Icon name="alert" size={28} />
      </div>
      <h1 style={{ font: "800 2rem/1.2 var(--font-display)", margin: "0 0 0.5rem", color: "var(--color-ink)" }}>Page Not Found</h1>
      <p style={{ color: "var(--color-muted)", margin: "0 0 1.5rem", maxWidth: "28rem" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Button variant="primary" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </Button>
    </div>
  );
}
