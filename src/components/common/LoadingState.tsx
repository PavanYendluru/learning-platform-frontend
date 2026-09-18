import { Icon } from "../layout/Icon";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="state-panel" role="status">
      <span className="state-icon"><Icon name="progress" /></span>
      <p>{message}</p>
    </div>
  );
}