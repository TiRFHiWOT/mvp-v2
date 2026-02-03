"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useMessages } from "@/hooks/useMessages";
import { usePusher } from "@/hooks/usePusher";
import { User } from "@/hooks/useAuth";
import MessageBubble, { groupMessages } from "./MessageBubble";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Info,
  Loader2,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { ContactInfoSidebar } from "./ContactInfoSidebar";
import { useRouter } from "next/navigation";

interface ChatWindowProps {
  sessionId: string;
  recipientId: string;
  recipientName: string;
  recipientPicture?: string;
  recipientOnline?: boolean;
  currentUser: User;
  onBack?: () => void;
}

export default function ChatWindow({
  sessionId,
  recipientId,
  recipientName,
  recipientPicture,
  recipientOnline = false,
  currentUser: user,
  onBack,
}: ChatWindowProps) {
  const { messages, loading, sendMessage, addMessage } = useMessages(sessionId);
  const {
    sendMessage: wsSendMessage,
    subscribeToSession,
    onMessage,
  } = usePusher(user?.id || null);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showEmojiPicker || showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Subscribe to Pusher channel for this session
  useEffect(() => {
    if (!sessionId || !subscribeToSession) return;
    const cleanup = subscribeToSession(sessionId);
    return cleanup;
  }, [sessionId, subscribeToSession]);

  // Handle incoming messages from Pusher
  useEffect(() => {
    if (!user || !sessionId || !onMessage) return;

    const cleanupMessage = onMessage("message", (data: any) => {
      if (data.sessionId === sessionId) {
        // De-duplicate messages we've already seen
        const messageKey = `${data.id || data.sessionId}-${data.senderId}-${data.content}`;

        if (processedMessagesRef.current.has(messageKey)) {
          return;
        }

        processedMessagesRef.current.add(messageKey);
        setTimeout(() => {
          processedMessagesRef.current.delete(messageKey);
        }, 5000);

        addMessage({
          id: data.id || `msg-${Date.now()}-${Math.random()}`,
          sessionId: data.sessionId,
          senderId: data.senderId,
          content: data.content,
          createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
          sender: data.sender || {
            id: data.senderId,
            name: "Other User",
          },
        });

        // If the message is from the recipient, mark it as read on the server
        if (data.senderId === recipientId) {
          const markAsRead = async () => {
            try {
              const token = localStorage.getItem("token");
              if (token) {
                await fetch("/api/notifications", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ senderId: recipientId }),
                });
                window.dispatchEvent(new CustomEvent('notifications-refetched'));
              }
            } catch (err) {
              console.error("Error marking message as read:", err);
            }
          };
          markAsRead();
        }
      }
    });


    return () => {
      if (cleanupMessage) cleanupMessage();
    };
  }, [sessionId, recipientId, recipientName, recipientPicture, user, onMessage, addMessage]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user || sending) return;

    const content = inputValue.trim();
    setSending(true);

    try {
      await sendMessage(content, user.id);
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
      setInputValue(content);
      setErrorMessage("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const messageGroups = useMemo(
    () => groupMessages(messages, user?.id || ""),
    [messages, user?.id || ""]
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "var(--bg-main)",
        }}
      >
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100%",
        backgroundColor: "var(--bg-surface)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--spacing-4) var(--spacing-6)",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
          <button
            onClick={handleBack}
            className="mobile-back-btn"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              marginRight: '-8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div className="avatar avatar-md" style={{ position: "relative" }}>
            {recipientPicture ? (
              <img src={recipientPicture} alt={recipientName} />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-white)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                {recipientName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`avatar-status ${recipientOnline ? "online" : "offline"}`} />
          </div>

          {/* User Info */}
          <div>
            <div
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
              }}
            >
              {recipientName}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
              }}
            >
              {recipientOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Actions removed as requested */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              className="icon-btn"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: showMenu ? "var(--bg-main)" : "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              title="More options"
            >
              <MoreVertical size={20} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  width: "180px",
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => {
                    setShowContactInfo(true);
                    setShowMenu(false);
                  }}
                  className="menu-item"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background-color 0.2s",
                  }}
                >
                  <Info size={16} />
                  Contact Info
                </button>
                {/* Add more items here if needed */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: "var(--spacing-6)",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--spacing-4)",
              }}
            >
              <Send size={32} color="var(--color-primary)" />
            </div>
            <h3
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
                marginBottom: "var(--spacing-2)",
              }}
            >
              Start a conversation
            </h3>
            <p style={{ fontSize: "var(--font-size-sm)" }}>
              Send your first message to {recipientName}
            </p>
          </div>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => {
              const firstMessage = group[0];
              const isOwn = firstMessage.senderId === user?.id;

              // Calculate date separator
              const messageDate = new Date(firstMessage.createdAt);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              let showDateSeparator = false;
              let dateLabel = "";

              // Check if we need to show a date separator
              if (groupIndex === 0) {
                showDateSeparator = true;
              } else {
                const prevGroup = messageGroups[groupIndex - 1];
                const prevDate = new Date(prevGroup[0].createdAt);
                if (messageDate.toDateString() !== prevDate.toDateString()) {
                  showDateSeparator = true;
                }
              }

              if (showDateSeparator) {
                if (messageDate.toDateString() === today.toDateString()) {
                  dateLabel = "Today";
                } else if (messageDate.toDateString() === yesterday.toDateString()) {
                  dateLabel = "Yesterday";
                } else {
                  dateLabel = messageDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  });
                }
              }

              return (
                <div key={`group-${groupIndex}-${firstMessage.id}`}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "16px 0",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: "var(--border-light)",
                        }}
                      />
                      <span
                        style={{
                          padding: "4px 16px",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--text-secondary)",
                          backgroundColor: "var(--bg-surface)",
                        }}
                      >
                        {dateLabel}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: "var(--border-light)",
                        }}
                      />
                    </div>
                  )}

                  {/* Message Group */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-1)",
                      marginBottom: "var(--spacing-4)",
                      alignItems: isOwn ? "flex-end" : "flex-start",
                    }}
                  >
                    {group.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showTimestamp={index === group.length - 1}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="chat-input-container"
        style={{
          padding: "var(--spacing-4) var(--spacing-6)",
          backgroundColor: "var(--bg-surface)",
          borderTop: "1px solid var(--border-light)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-3) var(--spacing-4)",
            backgroundColor: "var(--bg-main)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          {/* Emoji Picker */}
          <div style={{ position: "relative", flexShrink: 0 }} ref={emojiPickerRef}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <Smile size={20} />
            </button>

            {showEmojiPicker && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  marginBottom: "var(--spacing-2)",
                  zIndex: 50,
                }}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>

          {/* Attachment Button */}
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                flexShrink: 0,
              }}
            >
              <Paperclip size={20} />
            </button>
          </>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type any message..."
            disabled={sending}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontSize: "var(--font-size-base)",
              color: "var(--text-primary)",
              padding: "var(--spacing-2) 0",
              minWidth: 0,
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="btn-primary"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: inputValue.trim() && !sending ? 1 : 0.5,
              cursor: inputValue.trim() && !sending ? "pointer" : "not-allowed",
              flexShrink: 0,
            }}
          >
            {sending ? (
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid currentColor",
                  borderTopColor: "transparent",
                  borderRadius: "var(--radius-full)",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .icon-btn:hover {
          background-color: var(--bg-main) !important;
        }

        .menu-item:hover {
            background-color: var(--bg-main) !important;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Mobile Input Padding */
        /* Padding removed here, handled by page.tsx container padding-bottom: 60px */
      `}</style>
      {/* Contact Info Sidebar */}
      <ContactInfoSidebar
        isOpen={showContactInfo}
        onClose={() => setShowContactInfo(false)}
        user={{
          id: recipientId,
          name: recipientName,
          picture: recipientPicture,
          email: recipientId, // Using recipientId as email for now
        }}
        messages={messages}
      />

      {/* File Upload Modal */}
      {selectedFile && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--text-primary)",
              }}
            >
              Send File?
            </h3>

            {/* Image Preview */}
            {selectedFile.type.startsWith('image/') ? (
              <div style={{
                marginBottom: "16px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--border-light)",
                maxHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--bg-main)"
              }}>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div style={{
                marginBottom: "16px",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "8px"
              }}>
                <Paperclip size={32} color="var(--text-secondary)" />
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                  {selectedFile.type || 'Unknown file type'}
                </span>
              </div>
            )}

            <p
              style={{
                marginBottom: "24px",
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-md)",
                wordBreak: "break-all",
                textAlign: "center"
              }}
            >
              {selectedFile.name}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedFile || !user) return;

                  setSending(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('sessionId', sessionId);

                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('No auth token');

                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formData
                    });

                    if (!response.ok) {
                      throw new Error('Upload failed');
                    }

                    const data = await response.json();
                    // Send the file URL as a message
                    await sendMessage(data.url, user.id);

                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  } catch (error) {
                    console.error("Error uploading file:", error);
                    setErrorMessage("Failed to upload file");
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="btn-primary"
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.7 : 1,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {sending ? (
                  <>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "var(--radius-full)",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {errorMessage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 110,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid var(--border-light)",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "12px",
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-error, #ef4444)",
              }}
            >
              Error
            </h3>
            <p
              style={{
                marginBottom: "20px",
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-md)",
              }}
            >
              {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              className="btn-primary"
              style={{
                padding: "8px 24px",
                borderRadius: "var(--radius-md)",
                border: "none",
                backgroundColor: "var(--color-primary)",
                color: "white",
                cursor: "pointer",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
