import { useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into code block chunks and normal text chunks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="ai-markdown-content">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          return <CodeBlock key={index} codeChunk={part} />;
        }
        return <FormattedText key={index} textChunk={part} />;
      })}
    </div>
  );
}

function CodeBlock({ codeChunk }: { codeChunk: string }) {
  const [copied, setCopied] = useState(false);

  // Extract language and code content
  const firstNewline = codeChunk.indexOf("\n");
  let language = "text";
  let code = "";

  if (firstNewline !== -1) {
    language = codeChunk.slice(3, firstNewline).trim() || "text";
    code = codeChunk.slice(firstNewline + 1, -3);
  } else {
    code = codeChunk.slice(3, -3);
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="ai-code-block">
      <div className="ai-code-header">
        <span className="ai-code-lang">{language}</span>
        <button
          type="button"
          className="ai-code-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="ai-copy-success" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="ai-code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedText({ textChunk }: { textChunk: string }) {
  if (!textChunk.trim()) return null;

  // Split into lines for headings, lists, and paragraphs
  const lines = textChunk.split("\n");
  const elements: ReactNode[] = [];
  let currentList: ReactNode[] = [];
  let inList = false;

  const flushList = () => {
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="ai-markdown-list">
          {currentList}
        </ul>
      );
      currentList = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h4-${idx}`} className="ai-markdown-h4">
          {renderInlineFormatting(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${idx}`} className="ai-markdown-h3">
          {renderInlineFormatting(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${idx}`} className="ai-markdown-h2">
          {renderInlineFormatting(trimmed.slice(2))}
        </h2>
      );
    }
    // Bullet lists
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      currentList.push(
        <li key={`li-${idx}`} className="ai-markdown-li">
          {renderInlineFormatting(trimmed.slice(2))}
        </li>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, "");
      inList = true;
      currentList.push(
        <li key={`li-${idx}`} className="ai-markdown-li">
          {renderInlineFormatting(content)}
        </li>
      );
    }
    // Ordinary paragraph
    else {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="ai-markdown-p">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <>{elements}</>;
}

function renderInlineFormatting(text: string): ReactNode {
  // Parses `inline code`, **bold**, *italic*, and [link](url)
  // Split by inline code first
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="ai-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Process bold, links, and italics in non-code parts
    return parseTextDecorations(part, i);
  });
}

function parseTextDecorations(text: string, keyPrefix: number | string): ReactNode {
  // Match [label](url) and **bold**
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*)/g;
  const parts = text.split(regex);

  return parts.map((seg, j) => {
    const key = `${keyPrefix}-${j}`;

    // Link: [label](url)
    if (seg.startsWith("[") && seg.includes("](") && seg.endsWith(")")) {
      const closeBracket = seg.indexOf("](");
      const label = seg.slice(1, closeBracket);
      const url = seg.slice(closeBracket + 2, -1);
      return (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ai-markdown-link"
        >
          {label}
        </a>
      );
    }

    // Bold: **text**
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length >= 4) {
      return <strong key={key}>{seg.slice(2, -2)}</strong>;
    }

    // Italic: *text*
    if (seg.startsWith("*") && seg.endsWith("*") && seg.length >= 2) {
      return <em key={key}>{seg.slice(1, -1)}</em>;
    }

    return seg;
  });
}
