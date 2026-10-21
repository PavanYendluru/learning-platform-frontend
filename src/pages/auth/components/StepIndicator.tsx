interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="auth-step-indicator" role="navigation" aria-label="Registration steps">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCurrent = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div
            key={index}
            className={`auth-step-item ${isCurrent ? "current" : ""} ${isCompleted ? "completed" : ""}`}
          >
            <div className="auth-step-bubble">
              {isCompleted ? "✓" : stepNum}
            </div>
            <span className="auth-step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
