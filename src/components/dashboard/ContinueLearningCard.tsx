import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CourseProgress } from "../../types/dashboard.types";
import { Icon } from "../layout/Icon";

export function ContinueLearningCard({ course }: { course: CourseProgress }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article className="continue-card">
      <div className="course-art">
        <div className="spring-logo"><Icon name="sparkles" size={64} /></div>
        <span>{course.category}</span>
      </div>
      <div className="continue-body">
        <button
          className={`bookmark-button ${bookmarked ? "is-bookmarked" : ""}`}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark course"}
          type="button"
          onClick={() => setBookmarked((prev) => !prev)}
        >
          <Icon name="bookmark" size={18} />
        </button>
        <h2>{course.title}</h2>
        <b>Topic: {course.topic}</b>
        <p>{course.description}</p>
        <div className="continue-footer">
          <div>
            <span>Overall Progress</span>
            <strong>{course.progress}%</strong>
          </div>
          <div className="progress-track">
            <span className="progress-fill" style={{ width: `${course.progress}%` }} />
          </div>
        </div>
        <button
          className="continue-button"
          type="button"
          onClick={() => navigate("/domains")}
        >
          <Icon name="play" size={18} />
          Continue Learning
        </button>
      </div>
    </article>
  );
}