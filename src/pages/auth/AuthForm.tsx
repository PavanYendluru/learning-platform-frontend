import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { LoginRequest, RegisterRequest, Role } from "../../types/auth.types";

function homeForRole(role: Role) {
  return role === "ADMIN" ? "/admin" : "/dashboard";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [role, setRole] = useState<Role>("USER");
  const isLogin = role === "ADMIN" ? true : mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleRoleChange(next: Role) {
    setRole(next);
    setError("");
    if (next === "ADMIN" && mode === "register") {
      navigate("/login", { replace: true });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isLogin) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      let authenticatedRole: Role;

      if (isLogin) {
        const user = await login({ email, password } satisfies LoginRequest, role);
        authenticatedRole = user.role;
      } else {
        const user = await register({ name, email, password } satisfies RegisterRequest);
        authenticatedRole = user.role;
      }

      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      // Prefer safe home for role; only honor "from" if it matches that portal
      const fallback = homeForRole(authenticatedRole);
      const target =
        from &&
        ((authenticatedRole === "ADMIN" && from.startsWith("/admin")) ||
          (authenticatedRole === "USER" && !from.startsWith("/admin")))
          ? from
          : fallback;

      navigate(target, { replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to authenticate. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-kicker">LearnHub</p>
        <h1>
          {role === "ADMIN"
            ? "Admin sign in"
            : isLogin
              ? "Welcome back"
              : "Create your account"}
        </h1>
        <p>
          {role === "ADMIN"
            ? "Sign in with your admin credentials."
            : isLogin
              ? "Sign in to continue learning."
              : "Start building your learning journey."}
        </p>

        <div className="auth-role-toggle" role="group" aria-label="Select role">
          <button
            type="button"
            className={`auth-role-btn ${role === "USER" ? "active" : ""}`}
            onClick={() => handleRoleChange("USER")}
          >
            USER
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === "ADMIN" ? "active" : ""}`}
            onClick={() => handleRoleChange("ADMIN")}
          >
            ADMIN
          </button>
        </div>

        {!isLogin && (
          <label className="auth-field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoComplete="name"
              required
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <div className="auth-field">
          <div className="auth-field-header">
            <span>Password</span>
            {isLogin && (
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {!isLogin && (
          <label className="auth-field">
            <span>Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting
            ? "Please wait..."
            : isLogin
              ? role === "ADMIN"
                ? "Admin Log in"
                : "Log in"
              : "Register"}
        </button>

        {role === "USER" && (
          <p className="auth-switch">
            {isLogin ? "New here? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Register" : "Log in"}
            </Link>
          </p>
        )}

        {role === "ADMIN" && (
          <p className="auth-switch auth-switch-note">
            Admin accounts cannot self-register.
          </p>
        )}
      </form>
    </main>
  );
}