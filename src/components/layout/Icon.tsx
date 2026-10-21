import {
  Bell,
  Bookmark,
  BookOpen,
  ChartNoAxesCombined,
  CircleAlert,
  CircleCheck,
  Compass,
  Database,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Map,
  Menu,
  Play,
  Search,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  X,
  Sun,
  Moon,
  Monitor,
  Video,
  BookMarked,
  FileText,
  Newspaper,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Lock,
  type LucideIcon,
} from "lucide-react";

/**
 * Defines all available icon names used throughout the application.
 *
 * Using a union type ensures that only supported icon names
 * can be passed to the reusable Icon component.
 */
export type IconName =
  | "grid"
  | "compass"
  | "cap"
  | "bookmark"
  | "map"
  | "files"
  | "progress"
  | "settings"
  | "logout"
  | "bell"
  | "search"
  | "play"
  | "check"
  | "trend"
  | "database"
  | "code"
  | "cup"
  | "sparkles"
  | "user"
  | "menu"
  | "close"
  | "alert"
  | "inbox"
  | "sun"
  | "moon"
  | "monitor"
  | "video"
  | "bookMarked"
  | "fileText"
  | "newspaper"
  | "externalLink"
  | "plus"
  | "pencil"
  | "trash"
  | "chevronRight"
  | "chevronUp"
  | "chevronDown"
  | "arrowLeft"
  | "lock";

/**
 * Maps the application's icon names to their
 * corresponding Lucide React components.
 *
 * This keeps all icon definitions centralized so
 * individual components do not need to import
 * Lucide icons repeatedly.
 */
const icons: Record<IconName, LucideIcon> = {
  // Navigation Icons
  grid: LayoutDashboard,
  compass: Compass,
  cap: GraduationCap,
  bookmark: Bookmark,
  map: Map,
  files: Library,
  progress: ChartNoAxesCombined,
  settings: Settings,
  logout: LogOut,

  // Header / Action Icons
  bell: Bell,
  search: Search,
  play: Play,

  // Status / Statistics Icons
  check: CircleCheck,
  trend: ChartNoAxesCombined,
  alert: CircleAlert,
  inbox: Inbox,

  // Course / Category Icons
  database: Database,
  code: BookOpen,
  cup: Trophy,

  // General UI Icons
  sparkles: Sparkles,
  user: UserRound,
  menu: Menu,
  close: X,

  // Theme & Media & Actions
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  video: Video,
  bookMarked: BookMarked,
  fileText: FileText,
  newspaper: Newspaper,
  externalLink: ExternalLink,
  plus: Plus,
  pencil: Pencil,
  trash: Trash2,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  arrowLeft: ArrowLeft,
  lock: Lock,
};

/**
 * Props accepted by the reusable Icon component.
 */
type IconProps = {
  /**
   * Name of the icon to render.
   */
  name: IconName;

  /**
   * Icon size in pixels.
   *
   * Defaults to 20px.
   */
  size?: number;

  /**
   * Optional CSS class name.
   *
   * Useful when additional styling needs to be applied
   * from the component or stylesheet.
   */
  className?: string;

  /**
   * Optional inline styles.
   */
  style?: React.CSSProperties;
};

/**
 * Reusable Icon Component
 *
 * Centralizes Lucide icon rendering throughout the application.
 *
 * Example:
 *
 * <Icon name="search" />
 *
 * <Icon name="bookmark" size={24} />
 *
 * <Icon name="alert" className="error-icon" />
 *
 * This approach makes the icon system:
 * - Consistent
 * - Type-safe
 * - Easy to maintain
 * - Easy to update globally
 */
export function Icon({
  name,
  size = 20,
  className,
  style,
}: IconProps) {
  /**
   * Find the corresponding Lucide component
   * using the requested icon name.
   */
  const LucideIconComponent = icons[name];

  /**
   * Render the selected Lucide icon.
   *
   * `aria-hidden="true"` is used because these icons
   * are decorative when their surrounding button/text
   * already provides the accessible label.
   */
  return (
    <LucideIconComponent
      size={size}
      strokeWidth={2}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}