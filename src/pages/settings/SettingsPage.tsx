import { useEffect, useState } from "react";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { Icon } from "../../components/layout/Icon";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../../hooks/useToast";
import "./SettingsPage.css";

export function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);

  useEffect(() => {
    setFullName(user?.name ?? "");
  }, [user?.name]);

  const nameChanged = fullName.trim() !== (user?.name ?? "").trim();
  const nameValid = fullName.trim().length >= 2;

  async function handleSaveProfile() {
    if (!nameValid || !nameChanged) return;
    setSaving(true);
    try {
      await updateProfile(fullName.trim());
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-content">
      <PageHeader
        title="Settings & Profile"
        description="Manage your account preferences, theme appearance, and security settings."
      />

      <div className="settings-grid">
        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <Icon name="user" size={20} />
            </div>
            <h2>Profile Details</h2>
          </div>

          <div className="settings-field-group">
            <label className="settings-field">
              <span>Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                placeholder="Your full name"
              />
            </label>

            <label className="settings-field">
              <span>Email Address</span>
              <input type="email" value={user?.email ?? ""} readOnly disabled />
            </label>

            <label className="settings-field">
              <span>User ID</span>
              <input type="text" value={user?.id ? `#${user.id}` : "—"} readOnly disabled />
            </label>

            <label className="settings-field">
              <span>Account Role</span>
              <input type="text" value={user?.role ?? "USER"} readOnly disabled />
            </label>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              disabled={!nameValid || !nameChanged || saving}
            >
              {saving ? "Saving…" : "Save Name"}
            </Button>
            {!nameValid && fullName.trim().length > 0 && (
              <span style={{ color: "#dc2626", fontSize: "0.875rem" }}>
                Name must be at least 2 characters
              </span>
            )}
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <Icon name="sun" size={20} />
            </div>
            <h2>Appearance & Theme</h2>
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", margin: "0 0 1rem" }}>
            Select your preferred color theme for LearnHub.
          </p>
          <div className="theme-options-grid" role="radiogroup" aria-label="Theme">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`theme-option ${theme === t ? "active" : ""}`}
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
              >
                <Icon name={t === "dark" ? "moon" : t === "light" ? "sun" : "monitor"} size={18} />
                <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <Icon name="bell" size={20} />
            </div>
            <h2>Notifications</h2>
          </div>
          <label className="settings-toggle-row">
            <span>Email alerts</span>
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
          </label>
          <label className="settings-toggle-row">
            <span>Course & resource updates</span>
            <input type="checkbox" checked={courseUpdates} onChange={(e) => setCourseUpdates(e.target.checked)} />
          </label>
        </article>

        <article className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper">
              <Icon name="lock" size={20} />
            </div>
            <h2>Account Security</h2>
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-sm)", margin: "0 0 1rem" }}>
            Sign out of your account on this device.
          </p>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </article>
      </div>
    </section>
  );
}
