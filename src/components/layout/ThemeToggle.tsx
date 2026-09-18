import { useTheme } from "../../hooks/useTheme";
import { Icon, type IconName } from "./Icon";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const iconName: IconName = resolvedTheme === "dark" ? "sun" : "moon";
  const label = resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon name={iconName} size={18} />
    </button>
  );
}
