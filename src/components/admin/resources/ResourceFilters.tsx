import { Icon } from "../../layout/Icon";

interface ResourceFiltersProps {
  activeStatus: string;
  resourceTypeFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onResourceTypeChange: (type: string) => void;
  onSearchChange: (query: string) => void;
}

export function ResourceFilters({
  activeStatus,
  resourceTypeFilter,
  searchQuery,
  onStatusChange,
  onResourceTypeChange,
  onSearchChange,
}: ResourceFiltersProps) {
  const statusOptions = [
    { label: "All Statuses", value: "ALL" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Pending Review", value: "PENDING_REVIEW" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  const typeOptions = [
    { label: "All Types", value: "ALL" },
    { label: "Video", value: "VIDEO" },
    { label: "Documentation", value: "DOCUMENTATION" },
    { label: "Book", value: "BOOK" },
    { label: "Research Paper", value: "RESEARCH_PAPER" },
    { label: "Article", value: "ARTICLE" },
    { label: "Course", value: "COURSE" },
    { label: "GitHub", value: "GITHUB" },
    { label: "Practice", value: "PRACTICE" },
    { label: "Project", value: "PROJECT" },
    { label: "Tech Update", value: "TECHNOLOGY_UPDATE" },
  ];

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
      {/* Search Input */}
      <div style={{ position: "relative", flex: 1, minWidth: "15rem" }}>
        <Icon
          name="search"
          size={16}
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-muted)",
          }}
        />
        <input
          type="text"
          placeholder="Search resources by title, author, or publisher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            height: "2.35rem",
            paddingLeft: "2.25rem",
            paddingRight: "0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-line)",
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            fontSize: "var(--text-sm)",
          }}
        />
      </div>

      {/* Status Filter */}
      <select
        value={activeStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{
          height: "2.35rem",
          padding: "0 0.75rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-line)",
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          fontSize: "var(--text-sm)",
          minWidth: "9.5rem",
        }}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Resource Type Filter */}
      <select
        value={resourceTypeFilter}
        onChange={(e) => onResourceTypeChange(e.target.value)}
        style={{
          height: "2.35rem",
          padding: "0 0.75rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-line)",
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          fontSize: "var(--text-sm)",
          minWidth: "9.5rem",
        }}
      >
        {typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
