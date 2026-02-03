"use client";

import { Search, Bell, ChevronDown, X, User, LogOut, MessageSquare, UserPlus, Check, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContactInfoSidebar } from "./ContactInfoSidebar";
import { ConfirmationModal } from "./ConfirmationModal";

interface TopNavProps {
    title?: string;
    onSearch?: (query: string) => void;
}

// Mock data for notifications
import { formatDistanceToNow } from "date-fns";
interface Notification {
    id: string;
    type: string;
    title: string;
    description: string | null;
    read: boolean;
    createdAt: string;
    sender: {
        id: string;
        name: string | null;
        picture: string | null;
    } | null;
}



// Mock search results
const mockSearchResults = [
    { id: "1", name: "Sarah Wilson", type: "contact", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: "2", name: "Design Team Chat", type: "chat", avatar: null },
    { id: "3", name: "Schedule meeting", type: "message", preview: "...can we schedule a meeting for..." },
    { id: "4", name: "Alex Johnson", type: "contact", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
    { id: "5", name: "Project Updates", type: "chat", avatar: null },
];

export function TopNav({ title = "Message", onSearch }: TopNavProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter search results based on query
    const filteredResults = searchQuery.trim()
        ? mockSearchResults.filter(
            (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.preview && item.preview.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : [];

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowSearchResults(value.trim().length > 0);
        if (onSearch) onSearch(value);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setShowSearchResults(false);
        if (onSearch) onSearch("");
    };

    // Fetch notifications on mount
    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Set up an interval or socket listener here
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("/api/notifications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); // Optimistic update
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ all: true }),
            });
        } catch (error) {
            console.error("Error marking all as read:", error);
            fetchNotifications(); // Revert on error
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))); // Optimistic update
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id }),
            });
        } catch (error) {
            console.error("Error marking as read:", error);
            fetchNotifications(); // Revert on error
        }
    };

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
    };



    const handleGoToProfile = () => {
        setShowUserMenu(false);
        setShowProfileDrawer(true);
    };

    return (
        <>
            <header
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--spacing-4) var(--spacing-6)",
                    backgroundColor: "var(--bg-surface)",
                    borderBottom: "1px solid var(--border-light)",
                    height: "64px",
                    position: "relative",
                    zIndex: 100,
                }}
            >
                {/* Left Section - Title */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "var(--radius-full)",
                            border: "1px solid var(--border-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "var(--bg-surface)",
                        }}
                    >
                        <div
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "var(--color-primary)",
                            }}
                        />
                    </div>
                    <h1
                        style={{
                            fontSize: "var(--font-size-lg)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--text-primary)",
                            margin: 0,
                        }}
                    >
                        {title}
                    </h1>
                </div>

                {/* Center Section - Search Bar */}
                <div
                    ref={searchRef}
                    style={{
                        flex: 1,
                        maxWidth: "400px",
                        margin: "0 var(--spacing-8)",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-2)",
                            padding: "var(--spacing-2) var(--spacing-4)",
                            backgroundColor: "var(--bg-main)",
                            borderRadius: showSearchResults ? "var(--radius-lg) var(--radius-lg) 0 0" : "var(--radius-lg)",
                            border: "1px solid var(--border-light)",
                            borderBottom: showSearchResults ? "none" : "1px solid var(--border-light)",
                        }}
                    >
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search messages, contacts..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                backgroundColor: "transparent",
                                fontSize: "var(--font-size-sm)",
                                color: "var(--text-primary)",
                            }}
                        />
                        {searchQuery ? (
                            <button
                                onClick={clearSearch}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <X size={16} />
                            </button>
                        ) : (
                            <span
                                style={{
                                    fontSize: "var(--font-size-xs)",
                                    color: "var(--text-muted)",
                                    backgroundColor: "var(--bg-surface)",
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border-light)",
                                }}
                            >
                                ⌘K
                            </span>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border-light)",
                                borderTop: "none",
                                borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                                maxHeight: "320px",
                                overflowY: "auto",
                                zIndex: 200,
                            }}
                        >
                            {filteredResults.length > 0 ? (
                                <>
                                    <div
                                        style={{
                                            padding: "8px 12px",
                                            fontSize: "11px",
                                            color: "var(--text-muted)",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            borderBottom: "1px solid var(--border-light)",
                                        }}
                                    >
                                        Search Results
                                    </div>
                                    {filteredResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => {
                                                setShowSearchResults(false);
                                                // Handle search result click
                                            }}
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                padding: "10px 12px",
                                                border: "none",
                                                backgroundColor: "transparent",
                                                cursor: "pointer",
                                                transition: "all var(--transition-fast)",
                                                textAlign: "left",
                                            }}
                                            className="search-result-item"
                                        >
                                            {result.avatar ? (
                                                <img
                                                    src={result.avatar}
                                                    alt={result.name}
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "50%",
                                                        backgroundColor: result.type === "chat" ? "var(--color-primary-light)" : "var(--bg-main)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {result.type === "chat" ? (
                                                        <MessageSquare size={18} color="var(--color-primary)" />
                                                    ) : (
                                                        <Search size={18} color="var(--text-muted)" />
                                                    )}
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: 500,
                                                        color: "var(--text-primary)",
                                                        marginBottom: "2px",
                                                    }}
                                                >
                                                    {result.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "var(--text-muted)",
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {result.preview || result.type}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div
                                    style={{
                                        padding: "24px",
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                        fontSize: "14px",
                                    }}
                                >
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Section - Icons & Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                    {/* Notifications */}
                    <div ref={notificationRef} style={{ position: "relative" }}>
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowUserMenu(false);
                            }}
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "var(--radius-md)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "none",
                                backgroundColor: showNotifications ? "var(--bg-main)" : "transparent",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all var(--transition-fast)",
                                position: "relative",
                            }}
                            className="icon-btn"
                            title="Notifications"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "50%",
                                        backgroundColor: "#EF4444",
                                        color: "white",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px solid var(--bg-surface)",
                                    }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: "360px",
                                    backgroundColor: "var(--bg-surface)",
                                    borderRadius: "12px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                                    border: "1px solid var(--border-light)",
                                    zIndex: 200,
                                    overflow: "hidden",
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "16px",
                                        borderBottom: "1px solid var(--border-light)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <h3
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 600,
                                                color: "var(--text-primary)",
                                                margin: 0,
                                            }}
                                        >
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span
                                                style={{
                                                    backgroundColor: "var(--color-primary)",
                                                    color: "white",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "var(--color-primary)",
                                                fontSize: "13px",
                                                fontWeight: 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={() => markAsRead(notification.id)}
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "12px",
                                                    padding: "14px 16px",
                                                    border: "none",
                                                    backgroundColor: notification.read ? "transparent" : "rgba(79, 70, 229, 0.04)",
                                                    cursor: "pointer",
                                                    transition: "all var(--transition-fast)",
                                                    textAlign: "left",
                                                    borderBottom: "1px solid var(--border-light)",
                                                }}
                                                className="notification-item"
                                            >
                                                {/* Avatar */}
                                                {notification.sender?.picture ? (
                                                    <img
                                                        src={notification.sender.picture}
                                                        alt=""
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "50%",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "50%",
                                                            backgroundColor: notification.type === "message" ? "var(--color-primary-light)" : "#E5E7EB",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {notification.type === "message" ? (
                                                            <MessageSquare size={18} color="var(--color-primary)" />
                                                        ) : notification.type === "friend" ? (
                                                            <UserPlus size={18} color="var(--text-secondary)" />
                                                        ) : (
                                                            <Check size={18} color="var(--text-secondary)" />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            fontSize: "14px",
                                                            fontWeight: notification.read ? 400 : 600,
                                                            color: "var(--text-primary)",
                                                            marginBottom: "2px",
                                                        }}
                                                    >
                                                        {notification.title}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "13px",
                                                            color: "var(--text-secondary)",
                                                            marginBottom: "4px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {notification.description}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "var(--text-muted)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        <Clock size={12} />
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </div>
                                                </div>

                                                {/* Unread indicator */}
                                                {!notification.read && (
                                                    <div
                                                        style={{
                                                            width: "8px",
                                                            height: "8px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "var(--color-primary)",
                                                            flexShrink: 0,
                                                            marginTop: "6px",
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div
                                            style={{
                                                padding: "40px 24px",
                                                textAlign: "center",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            <Bell size={40} color="var(--border-light)" style={{ marginBottom: "12px" }} />
                                            <p style={{ fontSize: "14px", margin: 0 }}>No notifications yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div
                                    style={{
                                        padding: "12px 16px",
                                        borderTop: "1px solid var(--border-light)",
                                        textAlign: "center",
                                    }}
                                >
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "var(--color-primary)",
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                        }}
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* User Avatar & Menu */}
                    <div ref={userMenuRef} style={{ position: "relative" }}>
                        <div
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-2)",
                                cursor: "pointer",
                                padding: "4px 8px 4px 4px",
                                borderRadius: "var(--radius-lg)",
                                backgroundColor: showUserMenu ? "var(--bg-main)" : "transparent",
                                transition: "all var(--transition-fast)",
                            }}
                            className="user-avatar-btn"
                        >
                            <div
                                className="avatar"
                                style={{
                                    width: "36px",
                                    height: "36px",
                                }}
                            >
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name || "User"} />
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
                                            fontSize: "var(--font-size-sm)",
                                            fontWeight: "var(--font-weight-semibold)",
                                            borderRadius: "var(--radius-full)",
                                        }}
                                    >
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <ChevronDown
                                size={16}
                                color="var(--text-muted)"
                                style={{
                                    transition: "transform var(--transition-fast)",
                                    transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                                }}
                            />
                        </div>

                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: "260px",
                                    backgroundColor: "var(--bg-surface)",
                                    borderRadius: "12px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                                    border: "1px solid var(--border-light)",
                                    zIndex: 200,
                                    overflow: "hidden",
                                }}
                            >
                                {/* User Info */}
                                <div
                                    style={{
                                        padding: "16px",
                                        borderBottom: "1px solid var(--border-light)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {user?.picture ? (
                                            <img
                                                src={user.picture}
                                                alt={user.name || "User"}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    backgroundColor: "var(--color-primary)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    fontSize: "18px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: "15px",
                                                fontWeight: 600,
                                                color: "var(--text-primary)",
                                                marginBottom: "2px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {user?.name || "User"}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "13px",
                                                color: "var(--text-secondary)",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {user?.email || "user@example.com"}
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div style={{ padding: "8px" }}>
                                    <button
                                        onClick={handleGoToProfile}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 12px",
                                            border: "none",
                                            backgroundColor: "transparent",
                                            color: "var(--text-primary)",
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            borderRadius: "8px",
                                            transition: "all var(--transition-fast)",
                                            textAlign: "left",
                                        }}
                                        className="menu-item"
                                    >
                                        <User size={18} color="var(--text-secondary)" />
                                        View Profile
                                    </button>


                                </div>

                                {/* Logout */}
                                <div
                                    style={{
                                        padding: "8px",
                                        borderTop: "1px solid var(--border-light)",
                                    }}
                                >
                                    <button
                                        onClick={handleLogoutClick}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "10px 12px",
                                            border: "none",
                                            backgroundColor: "transparent",
                                            color: "#EF4444",
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            borderRadius: "8px",
                                            transition: "all var(--transition-fast)",
                                            textAlign: "left",
                                        }}
                                        className="menu-item logout-item"
                                    >
                                        <LogOut size={18} />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
                .icon-btn:hover {
                    background-color: var(--bg-main) !important;
                }
                .user-avatar-btn:hover {
                    background-color: var(--bg-main) !important;
                }
                .search-result-item:hover {
                    background-color: var(--bg-main) !important;
                }
                .notification-item:hover {
                    background-color: rgba(0, 0, 0, 0.02) !important;
                }
                .menu-item:hover {
                    background-color: #F3F4F6 !important;
                }
                .logout-item:hover {
                    background-color: #FEE2E2 !important;
                }
            `}</style>
            </header>

            {/* Profile Drawer - Outside header for proper z-index */}
            <ContactInfoSidebar
                isOpen={showProfileDrawer}
                onClose={() => setShowProfileDrawer(false)}
                title="My Profile"
                user={user ? {
                    id: user.id || "current-user",
                    name: user.name || "User",
                    picture: user.picture,
                    email: user.email || "user@example.com"
                } : null}
            />

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
                title="Log out"
                message="Are you sure you want to log out of your account?"
                confirmText="Log out"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
}
