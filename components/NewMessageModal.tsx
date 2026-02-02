"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: Array<{
        id: string;
        name: string;
        picture?: string;
        email: string;
    }>;
    onSelectUser: (userId: string) => void;
}

export function NewMessageModal({
    isOpen,
    onClose,
    users,
    onSelectUser,
}: NewMessageModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    if (!isOpen) return null;

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectUser = (userId: string) => {
        onSelectUser(userId);
        onClose();
        setSearchQuery("");
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999,
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    zIndex: 1000,
                    width: "90%",
                    maxWidth: "400px",
                    maxHeight: "600px",
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
                        padding: "var(--spacing-5)",
                        borderBottom: "1px solid var(--border-light)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "var(--font-size-lg)",
                            fontWeight: "var(--font-weight-semibold)",
                            color: "var(--text-primary)",
                            margin: 0,
                        }}
                    >
                        New Message
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: "32px",
                            height: "32px",
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
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: "var(--spacing-4)" }}>
                    <input
                        type="text"
                        placeholder="Search name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="input"
                        style={{
                            fontSize: "var(--font-size-sm)",
                        }}
                    />
                </div>

                {/* User List */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "0 var(--spacing-2)",
                    }}
                >
                    {filteredUsers.length === 0 ? (
                        <div
                            style={{
                                padding: "var(--spacing-6)",
                                textAlign: "center",
                                color: "var(--text-muted)",
                                fontSize: "var(--font-size-sm)",
                            }}
                        >
                            No users found
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                            {filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelectUser(user.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--spacing-3)",
                                        padding: "var(--spacing-3)",
                                        borderRadius: "var(--radius-md)",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all var(--transition-fast)",
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                    className="user-item"
                                >
                                    {/* Avatar */}
                                    <div className="avatar avatar-md">
                                        <img
                                            src={
                                                user.picture ||
                                                `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                                            }
                                            alt={user.name}
                                        />
                                    </div>

                                    {/* User Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: "var(--font-size-base)",
                                                fontWeight: "var(--font-weight-medium)",
                                                color: "var(--text-primary)",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {user.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "var(--font-size-sm)",
                                                color: "var(--text-secondary)",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {user.email}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <style jsx>{`
          .user-item:hover {
            background-color: var(--bg-main) !important;
          }
        `}</style>
            </div>
        </>
    );
}
