import type { ReactNode } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: Message[];
  followUpQuestions: string[];
  onFollowUpClick: (q: string) => void;
  assistantActions?: {
    messageIndex: number;
    controls: ReactNode;
  };
};

const orderedListPattern = /^\d+\.\s+/;
const unorderedListPattern = /^[-*]\s+/;
const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const bareUrlPattern = /(https?:\/\/[^\s<]+)/g;
const inlineCodePattern = /`([^`]+)`/g;
const boldPattern = /\*\*([^*]+)\*\*/g;

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(
    `${markdownLinkPattern.source}|${inlineCodePattern.source}|${boldPattern.source}|${bareUrlPattern.source}`,
    "g"
  );

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      nodes.push(
        <a
          key={`${match.index}-${match[2]}`}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="message-link"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      nodes.push(
        <code key={`${match.index}-${match[3]}`} className="message-inline-code">
          {match[3]}
        </code>
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={`${match.index}-${match[4]}`} className="font-semibold">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      nodes.push(
        <a
          key={`${match.index}-${match[5]}`}
          href={match[5]}
          target="_blank"
          rel="noreferrer"
          className="message-link"
        >
          {match[5]}
        </a>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderParagraph(text: string, key: string) {
  const lines = text.split("\n");

  return (
    <p key={key} className="leading-6">
      {lines.map((line, index) => (
        <span key={`${key}-line-${index}`}>
          {index > 0 ? <br /> : null}
          {renderInlineMarkdown(line)}
        </span>
      ))}
    </p>
  );
}

function renderMarkdownContent(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").filter(Boolean);
    const isOrderedList =
      lines.length > 1 && lines.every((line) => orderedListPattern.test(line));
    const isUnorderedList =
      lines.length > 1 && lines.every((line) => unorderedListPattern.test(line));

    if (isOrderedList) {
      return (
        <ol
          key={`ordered-${blockIndex}`}
          className="message-list list-decimal space-y-1 pl-5"
        >
          {lines.map((line, itemIndex) => (
            <li key={`ordered-${blockIndex}-${itemIndex}`}>
              {renderInlineMarkdown(line.replace(orderedListPattern, ""))}
            </li>
          ))}
        </ol>
      );
    }

    if (isUnorderedList) {
      return (
        <ul
          key={`unordered-${blockIndex}`}
          className="message-list list-disc space-y-1 pl-5"
        >
          {lines.map((line, itemIndex) => (
            <li key={`unordered-${blockIndex}-${itemIndex}`}>
              {renderInlineMarkdown(line.replace(unorderedListPattern, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return renderParagraph(block, `paragraph-${blockIndex}`);
  });
}

export default function MessageList({
  messages,
  followUpQuestions,
  onFollowUpClick,
  assistantActions,
}: Props) {
  return (
    <div className="theme-panel flex-1 space-y-3 overflow-y-auto rounded-xl p-4">
      {messages.map((m, i) => {
        const bubble = (
          <div
            className={`max-w-[70%] whitespace-pre-wrap break-words rounded-lg p-3 text-xs ${
              m.role === "user"
                ? "message-bubble-user ml-auto"
                : "message-bubble-assistant mr-auto"
            }`}
          >
            {m.role === "assistant" ? (
              <div className="message-markdown space-y-3">
                {renderMarkdownContent(m.content)}
              </div>
            ) : (
              m.content
            )}
          </div>
        );

        if (
          m.role === "assistant" &&
          assistantActions?.messageIndex === i
        ) {
          return (
            <div key={i} className="flex items-start gap-2">
              {bubble}
              {assistantActions.controls}
            </div>
          );
        }

        return <div key={i}>{bubble}</div>;
      })}

      {followUpQuestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {followUpQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onFollowUpClick(q)}
              className="theme-button-accent rounded-lg px-3 py-1 text-xs"
            >
              👉 {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
