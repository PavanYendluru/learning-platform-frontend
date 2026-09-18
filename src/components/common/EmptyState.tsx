import { Icon, type IconName } from "../layout/Icon";

export function EmptyState({
  title,
  message,
  icon = "inbox",
}: {
  title: string;
  message: string;
  icon?: IconName;
}) {
  return (
    <div className="state-panel">
      <span className="state-icon"><Icon name={icon} /></span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}