import { Sparkles, MessageSquare } from "lucide-react";

interface AiTutorButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function AiTutorButton({ isOpen, onClick }: AiTutorButtonProps) {
  return (
    <button
      type="button"
      className="ai-tutor-launcher"
      onClick={onClick}
      aria-label={isOpen ? "Close AI Tutor chat" : "Open AI Tutor chat"}
      aria-expanded={isOpen}
      title="Ask AI Tutor"
    >
      <span className="ai-tutor-pulse-ring" aria-hidden="true" />
      {isOpen ? <MessageSquare size={24} /> : <Sparkles size={24} />}
      <span className="ai-launcher-tooltip" role="tooltip">
        {isOpen ? "Close AI Tutor" : "Ask AI Tutor"}
      </span>
    </button>
  );
}
