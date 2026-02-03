"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Message } from "@/hooks/useMessages";

interface ContactInfoSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        picture?: string;
        email: string;
    } | null;
    title?: string;
    messages: Message[];
}

export function ContactInfoSidebar({
    isOpen,
    onClose,
    user,
    title = "Contact Info",
    messages = []
}: ContactInfoSidebarProps) {
    const [activeTab, setActiveTab] = useState<"media" | "link" | "docs">("media");

    if (!isOpen || !user) return null;

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

    const getDocIcon = (type: string) => {
        switch (type) {
            case "pdf": return { bg: "#DC2626", text: "PDF" };
            case "fig": return { bg: "#A855F7", text: "FIG" };
            case "ai": return { bg: "#F97316", text: "AI" };
            default: return { bg: "#6B7280", text: "DOC" };
        }
    };

    const mediaItems = messages.filter(m => isImage(m.content));
    const docItems = messages.filter(m => isDocument(m.content));
    // Simple link extraction logic - assumes message is just a URL if it starts with http
    const linkItems = messages.filter(m => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return m.content.match(urlRegex) && !isImage(m.content) && !isDocument(m.content);
    });

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    zIndex: 998,
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity var(--transition-normal)",
                }}
            />

            {/* Sidebar */}
            <div
                style={{
                    position: "fixed",
                    top: "16px",
                    right: "16px",
                    bottom: "16px",
                    width: "min(360px, calc(100vw - 32px))",
                    backgroundColor: "var(--bg-surface)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    zIndex: 999,
                    transform: isOpen ? "translateX(0)" : "translateX(calc(100% + 20px))",
                    transition: "transform var(--transition-normal)",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    border: "1px solid var(--border-light)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--border-light)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            margin: 0,
                        }}
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
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
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "24px 20px",
                        borderBottom: "1px solid var(--border-light)",
                    }}
                >
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            marginBottom: "12px",
                            backgroundColor: "var(--color-primary-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {user.picture ? (
                            <img
                                src={user.picture}
                                alt={user.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--color-primary)" }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                        }}
                    >
                        {user.name}
                    </div>
                    <div
                        style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                        }}
                    >
                        {user.email}
                    </div>
                </div>

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid var(--border-light)",
                        padding: "0 20px",
                    }}
                >
                    {(["media", "link", "docs"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: "12px 0",
                                border: "none",
                                backgroundColor: "transparent",
                                color: activeTab === tab ? "var(--text-primary)" : "var(--text-secondary)",
                                fontWeight: activeTab === tab ? 600 : 400,
                                fontSize: "14px",
                                cursor: "pointer",
                                borderBottom: activeTab === tab ? "2px solid var(--text-primary)" : "2px solid transparent",
                                transition: "all var(--transition-fast)",
                                textTransform: "capitalize",
                                marginBottom: "-1px",
                            }}
                        >
                            {tab === "media" ? "Media" : tab === "link" ? "Link" : "Docs"}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                    {activeTab === "media" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                            {mediaItems.length > 0 ? (
                                mediaItems.map((m) => (
                                    <div
                                        key={m.id}
                                        className="media-item"
                                        style={{ aspectRatio: "1", borderRadius: "8px", overflow: "hidden", cursor: "pointer", border: "1px solid var(--border-light)" }}
                                        onClick={() => window.open(m.content, '_blank')}
                                    >
                                        <img src={m.content} alt="Shared media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🖼️</div>
                                    <div style={{ fontSize: "14px" }}>No media shared yet</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "link" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {linkItems.length > 0 ? (
                                linkItems.map((m) => (
                                    <a
                                        key={m.id}
                                        href={m.content}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link-item"
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            backgroundColor: "var(--bg-main)",
                                            textDecoration: "none",
                                            color: "inherit",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            transition: "background-color 0.2s"
                                        }}
                                    >
                                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔗</div>
                                        <div style={{ flex: 1, overflow: "hidden" }}>
                                            <div style={{ fontWeight: 500, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.content}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</div>
                                    <div style={{ fontSize: "14px" }}>No links shared yet</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "docs" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {docItems.length > 0 ? (
                                docItems.map((m) => {
                                    const ext = m.content.split('.').pop()?.toLowerCase() || 'doc';
                                    const { bg, text } = getDocIcon(ext);
                                    return (
                                        <a
                                            key={m.id}
                                            href={m.content}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="doc-item"
                                            style={{
                                                padding: "12px",
                                                borderRadius: "8px",
                                                backgroundColor: "var(--bg-main)",
                                                textDecoration: "none",
                                                color: "inherit",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: bg, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>{text}</div>
                                            <div style={{ flex: 1, overflow: "hidden" }}>
                                                <div style={{ fontWeight: 500, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.content.split('/').pop()}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </a>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
                                    <div style={{ fontSize: "14px" }}>No documents shared yet</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <style jsx>{`
                    .action-btn:hover {
                        background-color: #F3F4F6 !important;
                    }
                    .media-item:hover {
                        opacity: 0.8;
                        transform: scale(1.02);
                    }
                    .link-item:hover,
                    .doc-item:hover {
                        background-color: #F3F4F6 !important;
                    }
                `}</style>
            </div>
        </>
    );
}
