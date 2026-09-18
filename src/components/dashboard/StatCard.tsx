import { Icon, type IconName } from "../layout/Icon";

type StatKind = "compass" | "check" | "bookmark" | "trend";

export function StatCard({ value, label, kind }: { value: string; label: string; kind: StatKind }) {
  const iconByKind: Record<StatKind, IconName> = {
    compass: "compass",
    check: "check",
    bookmark: "bookmark",
    trend: "trend",
  };

  return (
    <article className={`stat-card ${kind}`}>
      <span className="stat-icon"><Icon name={iconByKind[kind]} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}