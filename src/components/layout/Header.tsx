import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../../hooks/useAuth";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name ?? "Learner";
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="topbar">
      <button type="button" className="menu-toggle" aria-label="Open navigation" onClick={onMenuClick}>
        <Icon name="menu" size={22} />
      </button>

      <form className="search" onSubmit={handleSearchSubmit}>
        <Icon name="search" size={16} />
        <input
          placeholder="Search resources..."
          aria-label="Search learning content"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="user-area">
        <span className="welcome-message">
          {`Welcome back, ${displayName}`}
          <Icon name="sparkles" size={15} />
        </span>
        {user && <span className="user-role">{user.role}</span>}
        <ThemeToggle />
        <button className="notification" aria-label="Notifications" type="button">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <div className="avatar" title={user?.role} aria-label={`${displayName} profile`}>
          <Icon name="user" size={18} />
        </div>
        <button className="logout-control" type="button" onClick={logout} aria-label="Log out">
          <Icon name="logout" size={17} />
        </button>
      </div>
    </header>
  );
}
