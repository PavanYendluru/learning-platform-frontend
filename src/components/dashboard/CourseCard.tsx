import type { CourseProgress } from "../../types/dashboard.types";
import { Icon, type IconName } from "../layout/Icon";
import { LearningProgress } from "./LearningProgress";

const iconByCategory: Record<string, IconName> = {
  Frontend: "code",
  Backend: "cup",
  Database: "database",
};

export function CourseCard({ course }: { course: CourseProgress }) {
  const iconName = iconByCategory[course.category] ?? "code";
  return (
    <article className="course-card">
      <div className={`course-symbol ${course.category.toLowerCase()}`}>
        <Icon name={iconName} />
      </div>
      <span className="course-tag">{course.category}</span>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <LearningProgress value={course.progress} />
    </article>
  );
}