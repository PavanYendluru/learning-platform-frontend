import { Icon, type IconName } from "./Icon";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Navigation items displayed for regular users.
 */
const userNav: {
  label: string;
  icon: IconName;
  to: string;
}[] = [
  {
    label: "Dashboard",
    icon: "grid",
    to: "/dashboard",
  },
  {
    label: "Explore Domains",
    icon: "compass",
    to: "/domains",
  },
  {
    label: "My Learning",
    icon: "cap",
    to: "/my-learning",
  },
  {
    label: "Bookmarks",
    icon: "bookmark",
    to: "/bookmarks",
  },
  {
    label: "Learning Roadmaps",
    icon: "map",
    to: "/roadmaps",
  },
  {
    label: "Resources",
    icon: "files",
    to: "/resources",
  },
  {
    label: "Progress",
    icon: "progress",
    to: "/progress",
  },
  {
    label: "Settings",
    icon: "settings",
    to: "/settings",
  },
];

/**
 * Navigation items displayed for administrators.
 *
 * Additional admin navigation items such as Users,
 * Content, and Reports can be added later.
 */
const adminNav: {
  label: string;
  icon: IconName;
  to: string;
}[] = [
  {
    label: "Admin Control",
    icon: "grid",
    to: "/admin",
  },
  {
    label: "Manage Users",
    icon: "user",
    to: "/admin/users",
  },
  {
    label: "Manage Domains",
    icon: "compass",
    to: "/admin/domains",
  },
  {
    label: "Manage Topics",
    icon: "fileText",
    to: "/admin/topics",
  },
  {
    label: "Manage Resources",
    icon: "files",
    to: "/admin/resources",
  },
  {
    label: "Manage Roadmaps",
    icon: "map",
    to: "/admin/roadmaps",
  },
  {
    label: "Tech Updates",
    icon: "newspaper",
    to: "/admin/technology-updates",
  },
];

/**
 * Props accepted by the Sidebar component.
 */
type SidebarProps = {
  /**
   * Controls whether the mobile sidebar is open.
   *
   * Defaults to false.
   */
  open?: boolean;

  /**
   * Optional callback used to close the sidebar,
   * mainly for mobile navigation.
   */
  onClose?: () => void;
};

/**
 * Sidebar Component
 *
 * Provides the main application navigation.
 *
 * The navigation displayed depends on the authenticated
 * user's role:
 * - USER → User navigation
 * - ADMIN → Admin navigation
 *
 * The sidebar contains:
 * - LearnHub branding
 * - Role-aware navigation items
 * - Logout button
 *
 * It also supports an open/closed state for responsive
 * mobile navigation.
 */
export function Sidebar({
  open = false,
  onClose,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  /**
   * Select navigation items based on the authenticated
   * user's role.
   */
  const nav = user?.role === "ADMIN" ? adminNav : userNav;

  return (
    <aside
      className={open ? "sidebar is-open" : "sidebar"}
      aria-label="Main"
    >
      {/* =========================================
          APPLICATION BRAND
      ========================================= */}
      <div className="brand">
        <span className="brand-mark">
          <Icon
            name="cap"
            size={20}
          />
        </span>

        <span>
          <strong>LearnHub</strong>
          <small>Video Learning</small>
        </span>
      </div>

      {/* =========================================
          MAIN NAVIGATION
      ========================================= */}
      <nav className="sidebar-navigation">
        {nav.map(({ label, icon, to }) => {
          const isActive =
            location.pathname === to ||
            location.pathname.startsWith(`${to}/`);

          return (
            <button
              key={label}
              type="button"
              className={
                isActive
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                navigate(to);

                /* Close the mobile sidebar after navigation */
                onClose?.();
              }}
            >
              {/* Navigation Icon */}
              <Icon name={icon} />

              {/* Navigation Label */}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* =========================================
          SIDEBAR FOOTER

          This section is intended to remain at the
          bottom of the sidebar through the CSS layout.
      ========================================= */}
      <div className="sidebar-footer">
        <button
          className="nav-item logout"
          type="button"
          onClick={logout}
        >
          {/* Logout Icon */}
          <Icon name="logout" />

          {/* Logout Label */}
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}