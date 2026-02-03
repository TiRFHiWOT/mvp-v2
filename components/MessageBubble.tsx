"use client";

import { Message } from "@/hooks/useMessages";
import { Check, CheckCheck, FileText } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp?: boolean;
}

export default function MessageBubble({
  message,
  isOwn,
  showTimestamp = true,
}: MessageBubbleProps) {
  const date = new Date(message.createdAt);
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isImage = (url: string) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return url.startsWith('/uploads/') && imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isDocument = (url: string) => {
    if (!url) return false;
    const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
    return url.startsWith('/uploads/') && docExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        marginBottom: "var(--spacing-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          maxWidth: "80%",
        }}
      >
        <div
          style={{
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: isOwn
              ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
              : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
            backgroundColor: isOwn ? "var(--bubble-outgoing)" : "var(--bubble-incoming)",
            color: isOwn ? "var(--bubble-text-outgoing)" : "var(--bubble-text-incoming)",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            border: isOwn ? "none" : "1px solid var(--border-light)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-base)",
              lineHeight: "1.5",
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {isImage(message.content) ? (
              <img
                src={message.content}
                alt="Shared image"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "var(--radius-md)",
                  display: "block",
                  cursor: "pointer"
                }}
                onClick={() => window.open(message.content, '_blank')}
              />
            ) : isDocument(message.content) ? (
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: "inherit"
                }}
              >
                <div style={{
                  padding: "8px",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <FileText size={24} color="var(--color-primary)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                  <span style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px"
                  }}>
                    {message.content.split('/').pop()}
                  </span>
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>Click to view</span>
                </div>
              </a>
            ) : (
              message.content
            )}
          </div>
        </div>
        {showTimestamp && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "4px",
              marginBottom: "4px",
              fontSize: "11px",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {isOwn && (
              <CheckCheck
                size={14}
                style={{
                  color: "var(--color-primary)",
                }}
              />
            )}
            <span style={{ whiteSpace: "nowrap" }}>{timeString}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageGroup({
  messages,
  isOwn,
}: {
  messages: Message[];
  isOwn: boolean;
}) {
  if (messages.length === 0) return null;

  return (
    <div style={{ marginBottom: "var(--spacing-4)" }}>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={isOwn}
          showTimestamp={index === messages.length - 1}
        />
      ))}
    </div>
  );
}

export function groupMessages(
  messages: Message[],
  currentUserId: string,
  timeThreshold: number = 60000 // 1 minute threshold
): Message[][] {
  if (messages.length === 0) return [];

  const groups: Message[][] = [];
  let currentGroup: Message[] = [messages[0]];

  for (let i = 1; i < messages.length; i++) {
    const prevMessage = messages[i - 1];
    const currentMessage = messages[i];

    const prevTime = new Date(prevMessage.createdAt).getTime();
    const currentTime = new Date(currentMessage.createdAt).getTime();
    const timeDiff = currentTime - prevTime;

    const sameSender = prevMessage.senderId === currentMessage.senderId;
    const withinTimeThreshold = timeDiff < timeThreshold;

    if (sameSender && withinTimeThreshold) {
      currentGroup.push(currentMessage);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentMessage];
    }
  }

  groups.push(currentGroup);
  return groups;
}
