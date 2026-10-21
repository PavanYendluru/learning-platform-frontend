import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  X,
  History,
  Plus,
  Send,
  Trash2,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Copy,
  Check,
  ChevronRight,
  GraduationCap,
  Square,
  Cpu,
} from "lucide-react";
import { aiTutorApi } from "../../api/aiTutorApi";
import type {
  AiConversation,
  AiMessage,
  ReferencedResource,
  TeachingStyle,
} from "../../types/aiTutor.types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface AiTutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEACHING_STYLES: { value: TeachingStyle; label: string }[] = [
  { value: "GENERAL", label: "General Technical" },
  { value: "BEGINNER", label: "Beginner Friendly" },
  { value: "STEP_BY_STEP", label: "Step-by-Step" },
  { value: "PRACTICAL", label: "Practical Examples" },
  { value: "INTERVIEW", label: "Interview Prep" },
  { value: "CODE_DEBUG", label: "Debug & Code Review" },
  { value: "SUMMARY", label: "Topic Summary" },
];

const STARTER_PROMPTS = [
  "Explain Spring Boot Dependency Injection and @Autowired",
  "How do React 19 Actions and useActionState work?",
  "Give me common Java backend interview questions",
  "Recommend verified platform resources for modern CSS Grid",
];

export function AiTutorPanel({ isOpen, onClose }: AiTutorPanelProps) {
  const location = useLocation();

  // State
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AiConversation | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [teachingStyle, setTeachingStyle] = useState<TeachingStyle>("GENERAL");
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [providerSwitchNotice, setProviderSwitchNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  // Load conversation list when opened
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadConversations = async () => {
    try {
      const res = await aiTutorApi.listConversations(0, 30);
      setConversations(res.content);
      if (res.content.length > 0 && !activeConversation) {
        loadConversationDetails(res.content[0].id);
      }
    } catch {
      // Quiet fail if backend not reachable yet
    }
  };

  const loadConversationDetails = async (id: number) => {
    if (isStreaming) {
      handleStopGeneration();
    }
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const conv = await aiTutorApi.getConversation(id);
      setActiveConversation(conv);
      setMessages(conv.messages ?? []);
      setShowHistory(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = async () => {
    if (isStreaming) {
      handleStopGeneration();
    }
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const newConv = await aiTutorApi.createConversation({
        title: "New Conversation",
      });
      setActiveConversation(newConv);
      setMessages([]);
      setConversations((prev) => [newConv, ...prev]);
      setShowHistory(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create new conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiTutorApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete conversation");
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading || isStreaming) return;

    setErrorMessage(null);
    setProviderSwitchNotice(null);
    setInputText("");

    // Optimistically create conversation if none active
    let currentConvId = activeConversation?.id;
    if (!currentConvId) {
      try {
        const newConv = await aiTutorApi.createConversation({
          title: text.length > 40 ? text.slice(0, 37) + "..." : text,
        });
        currentConvId = newConv.id;
        setActiveConversation(newConv);
        setConversations((prev) => [newConv, ...prev]);
      } catch (err: any) {
        setErrorMessage(err.message || "Could not start conversation");
        return;
      }
    }

    // 1. Optimistic user message in UI
    const optimisticUserMsg: AiMessage = {
      id: Date.now(),
      role: "USER",
      content: text,
      teachingStyle,
      suggestedFollowUps: [],
      referencedResources: [],
      createdAt: new Date().toISOString(),
    };

    // 2. Optimistic assistant placeholder message in UI
    const assistantPlaceholderId = Date.now() + 1;
    const optimisticAssistantMsg: AiMessage = {
      id: assistantPlaceholderId,
      role: "ASSISTANT",
      content: "",
      teachingStyle,
      provider: "gemini",
      suggestedFollowUps: [],
      referencedResources: [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg, optimisticAssistantMsg]);
    setIsLoading(true);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await aiTutorApi.streamMessage(
      currentConvId,
      {
        content: text,
        teachingStyle,
        currentPage: location.pathname,
      },
      {
        onStart: (data) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? { ...msg, provider: data.provider }
                : msg
            )
          );
        },
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        onProviderSwitch: (data) => {
          setProviderSwitchNotice(data.reason || "Gemini unavailable. Switched to Groq fallback.");
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? { ...msg, provider: data.to }
                : msg
            )
          );
          setTimeout(() => setProviderSwitchNotice(null), 7000);
        },
        onReset: () => {
          // Mid-stream fallback: discard partial Gemini text before Groq output begins
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? { ...msg, content: "", provider: "groq" }
                : msg
            )
          );
        },
        onComplete: (data) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantPlaceholderId
                ? {
                    ...msg,
                    id: data.messageId ?? assistantPlaceholderId,
                    provider: data.provider,
                    suggestedFollowUps: data.suggestedFollowUps ?? [],
                    referencedResources: data.referencedResources ?? [],
                  }
                : msg
            )
          );
          setIsLoading(false);
          setIsStreaming(false);
          abortControllerRef.current = null;
          loadConversations();
        },
        onError: (errorMsg) => {
          // If no content was produced, remove the empty assistant bubble
          setMessages((prev) =>
            prev.filter(
              (msg) =>
                msg.id !== assistantPlaceholderId || msg.content.trim().length > 0
            )
          );
          setErrorMessage(errorMsg);
          setIsLoading(false);
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
      },
      controller.signal
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyAnswer = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-panel" role="dialog" aria-label="AI Tutor Chat Window">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-header-left">
          <div className="ai-header-avatar">
            <Sparkles size={18} />
            <span
              className={`ai-status-dot ${isLoading || isStreaming ? "thinking" : ""}`}
              title={isStreaming ? "Streaming response..." : isLoading ? "Thinking..." : "Online"}
            />
          </div>
          <div className="ai-header-meta">
            <h3>AI Tutor</h3>
            <span className="ai-header-subtitle">
              {activeConversation ? activeConversation.title : "Ready to help"}
            </span>
          </div>
        </div>

        <div className="ai-header-actions">
          <button
            type="button"
            className="ai-header-btn"
            onClick={handleStartNewChat}
            title="Start new conversation"
            aria-label="New chat"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            className={`ai-header-btn ${showHistory ? "active" : ""}`}
            onClick={() => setShowHistory(!showHistory)}
            title="View chat history"
            aria-label="Chat history"
          >
            <History size={18} />
          </button>
          <button
            type="button"
            className="ai-header-btn"
            onClick={onClose}
            title="Minimize chat"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Teaching Style Bar */}
      <div className="ai-style-bar">
        <div className="ai-style-label">
          <GraduationCap size={14} />
          <span>Style:</span>
        </div>
        <select
          value={teachingStyle}
          onChange={(e) => setTeachingStyle(e.target.value as TeachingStyle)}
          className="ai-style-select"
          aria-label="Teaching style"
          disabled={isStreaming}
        >
          {TEACHING_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      {/* Provider Failover Notification Banner */}
      {providerSwitchNotice && (
        <div className="ai-provider-switch-banner" role="status">
          <Cpu size={14} />
          <span>{providerSwitchNotice}</span>
        </div>
      )}

      {/* History Drawer Overlay */}
      {showHistory && (
        <div className="ai-history-drawer">
          <div className="ai-history-header">
            <h4>Saved Conversations ({conversations.length})</h4>
            <button
              type="button"
              className="ai-header-btn"
              onClick={() => setShowHistory(false)}
              aria-label="Close history"
            >
              <X size={16} />
            </button>
          </div>
          <div className="ai-history-list">
            {conversations.length === 0 ? (
              <p className="ai-empty-desc" style={{ padding: "1rem", textAlign: "center" }}>
                No saved conversations yet.
              </p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={`ai-history-item ${activeConversation?.id === c.id ? "active" : ""}`}
                  onClick={() => loadConversationDetails(c.id)}
                >
                  <div className="ai-history-item-meta">
                    <div className="ai-history-item-title">{c.title}</div>
                    <div className="ai-history-item-date">
                      {new Date(c.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ai-history-item-delete"
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    title="Delete conversation"
                    aria-label={`Delete ${c.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Message Scroll Area */}
      <div className="ai-messages-scroll">
        {messages.length === 0 && (
          <div className="ai-empty-welcome">
            <div className="ai-welcome-icon">
              <Sparkles size={28} />
            </div>
            <h4 className="ai-welcome-title">Hi! I'm your AI Tutor</h4>
            <p className="ai-welcome-desc">
              Ask me anything about Java, Spring Boot, React, APIs, SQL, or find verified learning resources on the platform.
            </p>

            <div className="ai-starter-chips">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="ai-starter-chip"
                  onClick={() => handleSendMessage(prompt)}
                >
                  <span>{prompt}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-message-row ${msg.role === "USER" ? "user" : "assistant"}`}
            >
              <div className={`ai-message-bubble ${msg.role === "USER" ? "user" : "assistant"}`}>
                {msg.role === "USER" ? (
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                ) : (
                  <>
                    {/* If this assistant bubble has no content yet but is loading, show typing dots */}
                    {msg.content === "" ? (
                      <div className="ai-bubble-thinking">
                        <div className="ai-typing-dots">
                          <span className="ai-dot" />
                          <span className="ai-dot" />
                          <span className="ai-dot" />
                        </div>
                        <span className="ai-thinking-text">AI Tutor is thinking...</span>
                      </div>
                    ) : (
                      <>
                        <MarkdownRenderer content={msg.content} />
                        {isStreaming && <span className="ai-streaming-cursor" aria-hidden="true" />}
                      </>
                    )}

                    {/* Referenced Verified Platform Resources */}
                    {msg.referencedResources && msg.referencedResources.length > 0 && (
                      <div className="ai-referenced-resources">
                        <div className="ai-ref-header">
                          <BookOpen size={13} />
                          <span>Platform Resources Recommended:</span>
                        </div>
                        {msg.referencedResources.map((res) => (
                          <ResourceCard key={res.id} resource={res} />
                        ))}
                      </div>
                    )}

                    {/* Action buttons (Copy answer & Provider indicator) */}
                    {msg.content !== "" && (
                      <div className="ai-bubble-footer">
                        {msg.provider && (
                          <span
                            className={`ai-provider-badge ${msg.provider === "groq" ? "fallback" : "primary"}`}
                            title={msg.provider === "groq" ? "Generated by Groq fallback" : "Generated by Gemini 3.1 Flash-Lite"}
                          >
                            <Cpu size={11} />
                            <span>{msg.provider === "groq" ? "Groq Fallback" : "Gemini"}</span>
                          </span>
                        )}

                        <button
                          type="button"
                          className="ai-action-btn"
                          onClick={() => handleCopyAnswer(msg.id, msg.content)}
                          title="Copy response to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={13} className="ai-copy-success" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Suggested Follow-up chips for assistant messages */}
              {msg.role === "ASSISTANT" &&
                msg.suggestedFollowUps &&
                msg.suggestedFollowUps.length > 0 && (
                  <div className="ai-followup-suggestions">
                    {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className="ai-followup-pill"
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isStreaming}
                      >
                        <Sparkles size={11} />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

        {/* Error banner */}
        {errorMessage && (
          <div className="ai-error-banner" role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="ai-retry-btn"
              onClick={() => handleSendMessage()}
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Footer */}
      <div className="ai-chat-footer">
        {/* Stop Generation Button when streaming */}
        {isStreaming && (
          <div className="ai-stop-wrapper">
            <button
              type="button"
              className="ai-stop-btn"
              onClick={handleStopGeneration}
              title="Stop generating response"
            >
              <Square size={12} fill="currentColor" />
              <span>Stop Generation</span>
            </button>
          </div>
        )}

        <div className="ai-input-wrapper">
          <textarea
            ref={textareaRef}
            className="ai-chat-textarea"
            placeholder="Ask a question... (Enter to send, Shift+Enter for newline)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={4000}
            disabled={isLoading || isStreaming}
          />
          <button
            type="button"
            className="ai-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading || isStreaming}
            aria-label="Send message"
            title="Send message"
          >
            <Send size={15} />
          </button>
        </div>

        <div className="ai-footer-disclaimer">
          <span>AI Tutor can make mistakes. Verify important learning resources.</span>
          <span>{inputText.length}/4000</span>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: ReferencedResource }) {
  const getIcon = () => {
    switch (resource.resourceType) {
      case "VIDEO":
        return <Video size={14} />;
      case "BOOK":
        return <BookOpen size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <a
      href={resource.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="ai-resource-card"
      title={resource.title}
    >
      <div className="ai-res-info">
        <span className="ai-res-badge">
          {getIcon()}
          <span style={{ marginLeft: "4px" }}>{resource.resourceType}</span>
        </span>
        <div>
          <div className="ai-res-title">{resource.title}</div>
          {resource.author && <div className="ai-res-meta">{resource.author}</div>}
        </div>
      </div>
      <ExternalLink size={14} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
    </a>
  );
}
