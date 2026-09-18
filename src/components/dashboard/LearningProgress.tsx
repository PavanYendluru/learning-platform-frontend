/**
 * LearningProgress Component
 *
 * Displays the learning progress of a course.
 *
 * The component ensures that the progress value
 * always remains between 0% and 100%.
 */
export function LearningProgress({
  value,
}: {
  value: number;
}) {
  /**
   * Restricts the progress value between 0 and 100.
   *
   * Examples:
   * - -10 becomes 0
   * - 50 remains 50
   * - 120 becomes 100
   */
  const progress = Math.max(
    0,
    Math.min(value, 100)
  );

  return (
    <div className="progress-group">
      {/* Progress Label and Percentage */}
      <div>
        <span>Progress</span>

        <strong>{progress}%</strong>
      </div>

      {/* Visual Progress Bar */}
      <div className="progress-track">
        <i
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}