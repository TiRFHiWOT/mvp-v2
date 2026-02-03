"use client";

import { Search, Plus, X, Check, BellOff, Loader2 } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { usePusher } from "@/hooks/usePusher";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { formatDistanceToNow } from "date-fns";
import { NewMessageModal } from "./NewMessageModal";
import { ChatContextMenu } from "./ChatContextMenu";

export function ChatList({
    currentUserId,
    activeId: propActiveId,
    onSelectChat,
    onContactInfo
}: {
    currentUserId: string;
    activeId?: string | null;
    onSelectChat: (id: string) => void;
    onContactInfo?: (user: any) => void;
}) {
    const { users, loading } = useUsers(currentUserId);
    const { onlineUsers } = usePusher(currentUserId);
    const { getUnreadCount, clearUnreadCount, markAsUnread } = useUnreadMessages(currentUserId);
    const [activeId, setActiveId] = useState<string | null>(propActiveId || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "muted">("all");
    const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; userId: string | null }>({
        isOpen: false,
        position: { x: 0, y: 0 },
        userId: null
    });
    const [mutedIds, setMutedIds] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('chatMutedIds');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        }
        return new Set();
    });
    const [manualUnreadIds, setManualUnreadIds] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('chatManualUnreadIds');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        }
        return new Set();
    });
    const filterRef = useRef<HTMLDivElement>(null);

    // Persist muted IDs to localStorage
    useEffect(() => {
        localStorage.setItem('chatMutedIds', JSON.stringify([...mutedIds]));
    }, [mutedIds]);

    // Sync with propActiveId
    useEffect(() => {
        if (propActiveId !== undefined && propActiveId !== activeId) {
            setActiveId(propActiveId);
            if (propActiveId) {
                // If the chat is opened via URL/prop, ensure it's marked as read
                markChatAsRead(propActiveId);
            }
        }
    }, [propActiveId]);

    // Persist manual unread IDs to localStorage
    useEffect(() => {
        localStorage.setItem('chatManualUnreadIds', JSON.stringify([...manualUnreadIds]));
    }, [manualUnreadIds]);

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Apply active filter
        if (activeFilter === "unread") {
            filtered = filtered.filter(user => getUnreadCount(user.id) > 0 || manualUnreadIds.has(user.id));
        } else if (activeFilter === "muted") {
            filtered = filtered.filter(user => mutedIds.has(user.id));
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [users, searchQuery, activeFilter, mutedIds, getUnreadCount, manualUnreadIds]);

    const markChatAsRead = async (id: string) => {
        clearUnreadCount(id); // Clear local unread count
        setManualUnreadIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

        // Mark notifications as read on server
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ senderId: id }),
                });
                // Notify other components (like TopNav) to refresh notifications
                window.dispatchEvent(new CustomEvent('notifications-refetched'));
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const handleSelect = async (id: string) => {
        setActiveId(id);
        await markChatAsRead(id);
        onSelectChat(id);
    };

    const handleContextMenu = (e: React.MouseEvent, userId: string) => {
        e.preventDefault();
        setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            userId
        });
    };

    const handleMute = (userId: string) => {
        setMutedIds((prev: Set<string>) => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const contextUser = useMemo(() => users.find(u => u.id === contextMenu.userId), [users, contextMenu.userId]);

    return (
        <div
            className="flex flex-col bg-white"
            style={{
                width: 'var(--chat-list-width)',
                height: '100%',
                borderRight: '1px solid var(--border-light)',
            }}
        >
            {/* Header with Title and New Message Button */}
            <div
                style={{
                    padding: '16px 16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                }}
            >
                <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    All Message
                </h1>
                <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="btn-primary"
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Plus size={16} />
                    New Message
                </button>
            </div>

            {/* Search Bar with Filter Icon */}
            <div style={{ padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search in message"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                            style={{
                                paddingLeft: '40px',
                                paddingRight: searchQuery ? '40px' : '12px',
                                fontSize: '14px',
                                height: '40px',
                                width: '100%',
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {/* Filter Icon with Dropdown */}
                    <div ref={filterRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                border: `1px solid ${activeFilter !== 'all' ? 'var(--color-primary)' : 'var(--border-light)'}`,
                                backgroundColor: activeFilter !== 'all' ? 'var(--color-primary-light)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: activeFilter !== 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
                                flexShrink: 0,
                                transition: 'all var(--transition-fast)',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>

                        {/* Filter Dropdown Menu */}
                        {showFilterMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    right: 0,
                                    width: '160px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                                    border: '1px solid var(--border-light)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                }}
                            >
                                {[
                                    { key: 'all', label: 'All Messages' },
                                    { key: 'unread', label: 'Unread' },
                                    { key: 'muted', label: 'Muted' },
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => {
                                            setActiveFilter(filter.key as "all" | "unread" | "muted");
                                            setShowFilterMenu(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: 'none',
                                            backgroundColor: activeFilter === filter.key ? 'var(--color-primary-light)' : 'transparent',
                                            color: activeFilter === filter.key ? 'var(--color-primary)' : 'var(--text-primary)',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                        }}
                                        className="filter-option"
                                    >
                                        {filter.label}
                                        {activeFilter === filter.key && (
                                            <Check size={16} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat List */}
            <div
                className="flex-1 overflow-y-auto"
                style={{ padding: '0 8px' }}
            >
                {loading ? (
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-primary)' }} />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                        No users found
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {filteredUsers.map((user) => {
                            const isOnline = onlineUsers.has(user.id);
                            const unread = getUnreadCount(user.id);
                            const isManualUnread = manualUnreadIds.has(user.id);
                            const isUnread = unread > 0 || isManualUnread;
                            const isActive = activeId === user.id;
                            const isMuted = mutedIds.has(user.id);
                            const isHovered = hoveredId === user.id;

                            return (
                                <div
                                    key={user.id}
                                    onMouseEnter={() => setHoveredId(user.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    {/* Chat Item */}
                                    <button
                                        onClick={() => handleSelect(user.id)}
                                        onContextMenu={(e) => handleContextMenu(e, user.id)}
                                        className="chat-item"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? 'var(--color-primary-light)' : isHovered ? '#F3F4F6' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            width: '100%',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="avatar avatar-md"
                                            style={{
                                                position: 'relative',
                                            }}
                                        >
                                            <img
                                                src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                                                alt={user.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <span className={`avatar-status ${isOnline ? 'online' : 'offline'}`} />
                                        </div>

                                        {/* User Info */}
                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span
                                                    className="truncate"
                                                    style={{
                                                        fontSize: '14px',
                                                        fontWeight: isUnread ? 700 : 600,
                                                        color: 'var(--text-primary)',
                                                    }}
                                                >
                                                    {user.name || user.email || "Unknown User"}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {user.lastSeen && (
                                                        <span
                                                            style={{
                                                                fontSize: '12px',
                                                                color: isUnread ? 'var(--color-primary)' : 'var(--text-muted)',
                                                                fontWeight: isUnread ? 600 : 400,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: false })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <p
                                                    className="truncate"
                                                    style={{
                                                        fontSize: '13px',
                                                        color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                        fontWeight: isUnread ? 500 : 400,
                                                        flex: 1,
                                                    }}
                                                >
                                                    {user.lastMessage || user.email}
                                                </p>
                                                {isMuted && <BellOff size={14} color="var(--text-muted)" />}
                                                {unread > 0 && (
                                                    <div
                                                        style={{
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'white',
                                                            borderRadius: '50%',
                                                            width: '18px',
                                                            height: '18px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {unread}
                                                    </div>
                                                )}
                                                {unread === 0 && isManualUnread && user.lastMessage && (
                                                    <div
                                                        style={{
                                                            backgroundColor: 'var(--color-primary)',
                                                            borderRadius: '50%',
                                                            width: '10px',
                                                            height: '10px',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .chat-item:hover {
                    background-color: #F3F4F6 !important;
                }
                .filter-option:hover {
                    background-color: #F3F4F6 !important;
                }
            `}</style>

            {/* New Message Modal */}
            <NewMessageModal
                isOpen={showNewMessageModal}
                onClose={() => setShowNewMessageModal(false)}
                users={users}
                onSelectUser={handleSelect}
            />

            {/* Context Menu */}
            <ChatContextMenu
                isOpen={contextMenu.isOpen}
                onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
                position={contextMenu.position}
                hasMessages={!!contextUser?.lastMessage}
                isUnread={
                    contextMenu.userId ?
                        (getUnreadCount(contextMenu.userId) > 0 || manualUnreadIds.has(contextMenu.userId))
                        : false
                }
                isMuted={contextMenu.userId ? mutedIds.has(contextMenu.userId) : false}
                onMarkAsUnread={() => {
                    if (contextMenu.userId) {
                        const isRealUnread = getUnreadCount(contextMenu.userId) > 0;
                        const isManualUnread = manualUnreadIds.has(contextMenu.userId);

                        if (isRealUnread || isManualUnread) {
                            if (isRealUnread) clearUnreadCount(contextMenu.userId);
                            if (isManualUnread) {
                                setManualUnreadIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(contextMenu.userId!);
                                    return next;
                                });
                            }
                        } else {
                            setManualUnreadIds(prev => new Set(prev).add(contextMenu.userId!));
                        }
                    }
                }}
                onMute={() => {
                    if (contextMenu.userId) handleMute(contextMenu.userId);
                }}
            />
        </div>
    );
}
