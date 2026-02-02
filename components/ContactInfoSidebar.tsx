"use client";

import { X } from "lucide-react";
import { useState } from "react";

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
}

export function ContactInfoSidebar({
    isOpen,
    onClose,
    user,
    title = "Contact Info"
}: ContactInfoSidebarProps) {
    const [activeTab, setActiveTab] = useState<"media" | "link" | "docs">("media");

    if (!isOpen || !user) return null;

    // Data is empty for now until real sharing is implemented
    const mediaItems: any[] = [];
    const linkItems: any[] = [];
    const docItems: any[] = [];

    const getDocIcon = (type: string) => {
        switch (type) {
            case "pdf": return { bg: "#DC2626", text: "PDF" };
            case "fig": return { bg: "#A855F7", text: "FIG" };
            case "ai": return { bg: "#F97316", text: "AI" };
            default: return { bg: "#6B7280", text: "DOC" };
        }
    };

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
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    maxWidth: "360px",
                    backgroundColor: "var(--bg-surface)",
                    boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.1)",
                    zIndex: 999,
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform var(--transition-normal)",
                    display: "flex",
                    flexDirection: "column",
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
                        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🖼️</div>
                            <div style={{ fontSize: "14px" }}>No media shared yet</div>
                        </div>
                    )}

                    {activeTab === "link" && (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</div>
                            <div style={{ fontSize: "14px" }}>No links shared yet</div>
                        </div>
                    )}

                    {activeTab === "docs" && (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
                            <div style={{ fontSize: "14px" }}>No documents shared yet</div>
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
