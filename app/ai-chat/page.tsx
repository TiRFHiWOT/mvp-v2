"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { Send, Sparkles, Plus, Trash2, MessageSquare, X } from "lucide-react";
import { useState, useRef } from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export default function AIChat() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };
    };

    // Fetch all sessions
    const fetchSessions = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/ai-sessions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.sessions) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setIsLoadingSessions(false);
        }
    }, []);

    // Fetch messages for a session
    const fetchSessionMessages = useCallback(async (sessionId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/ai-sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            console.log("Fetched session data:", data);

            if (data.session?.messages && data.session.messages.length > 0) {
                setMessages(data.session.messages.map((msg: { id: string; role: string; content: string; createdAt: string }) => ({
                    id: msg.id,
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                    timestamp: new Date(msg.createdAt),
                })));
            } else {
                // Show welcome message if no messages exist
                setMessages([{
                    id: "welcome",
                    role: "assistant",
                    content: "Hello! I'm your AI assistant. How can I help you today?",
                    timestamp: new Date(),
                }]);
            }
        } catch (error) {
            console.error("Error fetching session messages:", error);
        }
    }, []);

    // Create new session
    const createNewSession = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/ai-sessions", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.session) {
                setSessions(prev => [data.session, ...prev]);
                setCurrentSessionId(data.session.id);
                setMessages([{
                    id: "welcome",
                    role: "assistant",
                    content: "Hello! I'm your AI assistant. How can I help you today?",
                    timestamp: new Date(),
                }]);
            }
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    // Delete session
    const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            await fetch(`/api/ai-sessions/${sessionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    // Select session
    const selectSession = (sessionId: string) => {
        setCurrentSessionId(sessionId);
        fetchSessionMessages(sessionId);
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchSessions();
        }
    }, [user, fetchSessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const token = localStorage.getItem("token");

        // Create session if none exists
        let sessionId = currentSessionId;
        if (!sessionId) {
            try {
                const response = await fetch("/api/ai-sessions", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.session) {
                    sessionId = data.session.id;
                    setSessions(prev => [data.session, ...prev]);
                    setCurrentSessionId(sessionId);
                }
            } catch (error) {
                console.error("Error creating session:", error);
                return;
            }
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date(),
        };

        const conversationHistory = messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        setMessages((prev) => [...prev, userMessage]);
        const messageToSend = inputValue;
        setInputValue("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/ai-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: messageToSend,
                    conversationHistory: conversationHistory,
                    sessionId: sessionId,
                }),
            });

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);

            // Refresh sessions to update titles
            fetchSessions();
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I'm having trouble responding right now. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-main)" }}>
                <div style={{ color: "var(--text-muted)" }}>Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-main)" }}>
            <Sidebar />

            <div className="ai-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <TopNav title="AI Chat" />

                <div className="ai-split-view" style={{ flex: 1, display: "flex", margin: "var(--spacing-4)", gap: "var(--spacing-4)", overflow: "hidden", position: "relative" }}>
                    {/* Chat History Sidebar */}
                    <div
                        className={`ai-history-sidebar ${showHistory ? 'open' : ''}`}
                        style={{
                            width: "260px",
                            backgroundColor: "var(--bg-surface)",
                            borderRadius: "var(--radius-xl)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}>
                        {/* New Chat Button */}
                        <div style={{ padding: "var(--spacing-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button
                                onClick={() => {
                                    createNewSession();
                                    setShowHistory(false);
                                }}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "var(--spacing-2)",
                                    padding: "var(--spacing-3)",
                                    backgroundColor: "var(--color-primary)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "var(--radius-lg)",
                                    cursor: "pointer",
                                    fontWeight: "var(--font-weight-medium)",
                                    transition: "all var(--transition-fast)",
                                }}
                            >
                                <Plus size={18} />
                                New Chat
                            </button>
                            {/* Close button for mobile */}
                            <button
                                className="mobile-close-history"
                                onClick={() => setShowHistory(false)}
                                style={{
                                    display: "none",
                                    background: "none",
                                    border: "none",
                                    marginLeft: "8px",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Sessions List */}
                        <div style={{ flex: 1, overflow: "auto", padding: "0 var(--spacing-3) var(--spacing-3)" }}>
                            {isLoadingSessions ? (
                                <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--text-muted)" }}>
                                    Loading...
                                </div>
                            ) : sessions.length === 0 ? (
                                <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
                                    No chats yet. Start a new conversation!
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => {
                                            selectSession(session.id);
                                            setShowHistory(false);
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "var(--spacing-2)",
                                            padding: "var(--spacing-3)",
                                            borderRadius: "var(--radius-md)",
                                            cursor: "pointer",
                                            backgroundColor: currentSessionId === session.id ? "var(--bg-main)" : "transparent",
                                            marginBottom: "var(--spacing-1)",
                                            transition: "all var(--transition-fast)",
                                        }}
                                    >
                                        <MessageSquare size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                        <span style={{
                                            flex: 1,
                                            fontSize: "var(--font-size-sm)",
                                            color: "var(--text-primary)",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}>
                                            {session.title}
                                        </span>
                                        <button
                                            onClick={(e) => deleteSession(session.id, e)}
                                            style={{
                                                padding: "var(--spacing-1)",
                                                border: "none",
                                                background: "none",
                                                cursor: "pointer",
                                                color: "var(--text-muted)",
                                                opacity: 0.5,
                                                transition: "opacity var(--transition-fast)",
                                            }}
                                            title="Delete chat"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div
                        className="ai-chat-area"
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "var(--bg-surface)",
                            borderRadius: "var(--radius-xl)",
                            overflow: "hidden",
                        }}>
                        {/* Header */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-3)",
                            padding: "var(--spacing-4) var(--spacing-6)",
                            borderBottom: "1px solid var(--border-light)",
                        }}>
                            {/* Mobile History Toggle */}
                            <button
                                className="mobile-history-toggle"
                                onClick={() => setShowHistory(true)}
                                style={{
                                    display: "none",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--text-primary)",
                                    padding: "4px",
                                    marginRight: "4px",
                                }}
                            >
                                <MessageSquare size={20} />
                            </button>
                            <div style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "var(--radius-full)",
                                background: "linear-gradient(135deg, var(--color-primary), #6366f1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <Sparkles size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>
                                    AI Assistant
                                </div>
                                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)" }}>
                                    Always ready to help
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-6)" }}>
                            {!currentSessionId && messages.length === 0 ? (
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    color: "var(--text-muted)",
                                }}>
                                    <Sparkles size={48} style={{ marginBottom: "var(--spacing-4)", opacity: 0.5 }} />
                                    <p style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--spacing-2)" }}>
                                        How can I help you today?
                                    </p>
                                    <p style={{ fontSize: "var(--font-size-sm)" }}>
                                        Start a conversation or select a previous chat
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                                                marginBottom: "var(--spacing-4)",
                                            }}
                                        >
                                            <div style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: "var(--spacing-3)",
                                                maxWidth: "70%",
                                                flexDirection: message.role === "user" ? "row-reverse" : "row",
                                            }}>
                                                <div style={{
                                                    width: "36px",
                                                    height: "36px",
                                                    borderRadius: "var(--radius-full)",
                                                    background: message.role === "assistant"
                                                        ? "linear-gradient(135deg, var(--color-primary), #6366f1)"
                                                        : "var(--color-primary)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}>
                                                    {message.role === "assistant" ? (
                                                        <Sparkles size={18} color="white" />
                                                    ) : (
                                                        <span style={{ color: "white", fontSize: "var(--font-size-sm)" }}>
                                                            {user.name?.[0]?.toUpperCase() || "U"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    padding: "var(--spacing-3) var(--spacing-4)",
                                                    borderRadius: "var(--radius-lg)",
                                                    backgroundColor: message.role === "user" ? "var(--bubble-outgoing)" : "var(--bubble-incoming)",
                                                    color: message.role === "user" ? "var(--bubble-text-outgoing)" : "var(--bubble-text-incoming)",
                                                }}>
                                                    <p style={{ margin: 0, fontSize: "var(--font-size-base)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                                        {message.content}
                                                    </p>
                                                    <span style={{ fontSize: "var(--font-size-xs)", opacity: 0.7, marginTop: "var(--spacing-1)", display: "block" }}>
                                                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                                            <div style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "var(--radius-full)",
                                                background: "linear-gradient(135deg, var(--color-primary), #6366f1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <Sparkles size={18} color="white" />
                                            </div>
                                            <div style={{
                                                padding: "var(--spacing-3) var(--spacing-4)",
                                                borderRadius: "var(--radius-lg)",
                                                backgroundColor: "var(--bubble-incoming)",
                                            }}>
                                                <div style={{ display: "flex", gap: "4px" }}>
                                                    <span className="typing-dot" style={{ animationDelay: "0ms" }}>•</span>
                                                    <span className="typing-dot" style={{ animationDelay: "150ms" }}>•</span>
                                                    <span className="typing-dot" style={{ animationDelay: "300ms" }}>•</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: "var(--spacing-4) var(--spacing-6)", borderTop: "1px solid var(--border-light)" }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-3)",
                                padding: "var(--spacing-3) var(--spacing-4)",
                                backgroundColor: "var(--bg-main)",
                                borderRadius: "var(--radius-xl)",
                            }}>
                                <input
                                    type="text"
                                    placeholder="Ask AI anything..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={{
                                        flex: 1,
                                        border: "none",
                                        outline: "none",
                                        backgroundColor: "transparent",
                                        fontSize: "var(--font-size-base)",
                                        color: "var(--text-primary)",
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isTyping}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "var(--radius-full)",
                                        backgroundColor: inputValue.trim() ? "var(--color-primary)" : "var(--text-muted)",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: inputValue.trim() ? "pointer" : "not-allowed",
                                        transition: "all var(--transition-fast)",
                                    }}
                                >
                                    <Send size={18} color="white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes typing {
                    0%, 60%, 100% { opacity: 0.3; }
                    30% { opacity: 1; }
                }
                .typing-dot {
                    animation: typing 1s infinite;
                    font-size: 20px;
                    color: var(--text-muted);
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .ai-split-view {
                        flex-direction: column !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                    }

                    .ai-chat-area {
                        border-radius: 0 !important;
                        padding-bottom: 60px !important; /* Space for Bottom Nav */
                    }

                    .ai-history-sidebar {
                        position: absolute !important;
                        top: 0;
                        left: 0;
                        bottom: 60px; /* Stop above bottom nav */
                        width: 85% !important;
                        height: auto !important;
                        z-index: 50;
                        transform: translateX(-110%);
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 4px 0 16px rgba(0,0,0,0.1);
                        border-radius: 0 !important;
                    }

                    .ai-history-sidebar.open {
                        transform: translateX(0);
                    }
                    
                    /* Overlay when sidebar is open */
                    .ai-split-view::after {
                        content: '';
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.4);
                        z-index: 40;
                        display: none;
                        opacity: 0;
                        transition: opacity 0.3s;
                    } 
                    
                    /* We can't easily target the pseudo-element state from JS without a parent class. 
                       Let's just use the sidebar transform logic. 
                       Use a separate overlay div if possible, or just rely on the shadow.
                    */

                    .mobile-history-toggle {
                        display: block !important;
                    }
                    
                    .mobile-close-history {
                        display: block !important;
                    }
                    
                    .ai-content-wrapper {
                        padding-bottom: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
