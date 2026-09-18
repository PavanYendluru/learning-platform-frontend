export function LearningProgress({ value }: { value: number }) {
  const progress = Math.max(0, Math.min(value, 100));
  return (
    <div className="progress-group">
      <div>
        <span>Progress</span>
        <strong>{progress}%</strong>
      </div>
      <div className="progress-track">
        <span className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}