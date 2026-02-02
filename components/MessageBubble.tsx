"use client";

import { Message } from "@/hooks/useMessages";
import { Check, CheckCheck } from "lucide-react";

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
            {message.content}
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
