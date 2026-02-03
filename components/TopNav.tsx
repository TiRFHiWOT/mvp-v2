"use client";

import { Search, Bell, ChevronDown, X, User, LogOut, MessageSquare, UserPlus, Check, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContactInfoSidebar } from "./ContactInfoSidebar";
import { SidebarMenu } from "./SidebarMenu";
import { usePusher } from "@/hooks/usePusher";
import { useUsers } from "@/hooks/useUsers";

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

export function TopNav({ title = "Message", onSearch }: TopNavProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { users } = useUsers(user?.id || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [mobileSearchActive, setMobileSearchActive] = useState(false);

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
        ? users.filter(
            (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.email.toLowerCase().includes(searchQuery.toLowerCase())
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

    const { subscribeToChannel } = usePusher(user?.id || null);

    // Fetch notifications on mount and subscribe
    useEffect(() => {
        if (user) {
            fetchNotifications();

            const unsubscribe = subscribeToChannel(
                `private-user-${user.id}`,
                "new-notification",
                (data: Notification) => {
                    setNotifications((prev) => [data, ...prev]);
                }
            );

            // Listen for internal notification refresh requests
            const handleRefresh = () => {
                fetchNotifications();
            };
            window.addEventListener('notifications-refetched', handleRefresh);

            return () => {
                unsubscribe();
                window.removeEventListener('notifications-refetched', handleRefresh);
            };
        }
    }, [user, subscribeToChannel]);

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

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        setShowNotifications(false);

        if (notification.type === "message" && notification.sender?.id) {
            router.push(`/?userId=${notification.sender.id}`);
        }
    };




    const handleGoToProfile = () => {
        setShowUserMenu(false);
        setShowProfileDrawer(true);
    };

    return (
        <>
            <header
                className="top-nav-header"
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
                <div
                    className={`top-nav-title ${mobileSearchActive ? "mobile-search-active" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}
                >
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

                {/* Center Section - Search Bar (Desktop) */}
                <div
                    ref={searchRef}
                    className="top-nav-search"
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
                            placeholder="Search..."
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
                                className="search-shortcut"
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
                            {/* ... Content same as before but keeping it concise here ... */}
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
                                                setSearchQuery("");
                                                router.push(`/?userId=${result.id}`);
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
                                            {result.picture ? (
                                                <img
                                                    src={result.picture}
                                                    alt={result.name}
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "50%",
                                                        backgroundColor: "var(--color-primary-light)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <User size={18} color="var(--color-primary)" />
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
                                                    {result.email}
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
                <div
                    className="top-nav-actions"
                    style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}
                >
                    {/* Mobile Only Search */}
                    <div
                        className="mobile-only-search"
                        style={{
                            display: "none",
                            flex: mobileSearchActive ? 1 : "initial",
                            position: "relative"
                        }}
                    >
                        {!mobileSearchActive ? (
                            <button
                                onClick={() => setMobileSearchActive(true)}
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
                                }}
                            >
                                <Search size={20} />
                            </button>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "8px" }}>
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--spacing-2)",
                                        padding: "var(--spacing-2) var(--spacing-4)",
                                        backgroundColor: "var(--bg-main)",
                                        borderRadius: "var(--radius-lg)",
                                        border: "1px solid var(--border-light)",
                                    }}
                                >
                                    <Search size={16} color="var(--text-muted)" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        style={{
                                            flex: 1,
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "transparent",
                                            fontSize: "var(--font-size-sm)",
                                            color: "var(--text-primary)",
                                            minWidth: 0,
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setMobileSearchActive(false);
                                        clearSearch();
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "4px",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    <X size={20} />
                                </button>
                                {searchQuery && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: "0",
                                            right: "0",
                                            marginTop: "8px",
                                            backgroundColor: "var(--bg-surface)",
                                            border: "1px solid var(--border-light)",
                                            borderRadius: "var(--radius-lg)",
                                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                                            maxHeight: "300px",
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
                                                        borderBottom: "1px solid var(--border-light)",
                                                    }}
                                                >
                                                    Search Results
                                                </div>
                                                {filteredResults.map((result) => (
                                                    <button
                                                        key={result.id}
                                                        onClick={() => {
                                                            setMobileSearchActive(false);
                                                            setSearchQuery("");
                                                            router.push(`/?userId=${result.id}`);
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
                                                            textAlign: "left",
                                                            borderBottom: "1px solid var(--border-light)"
                                                        }}
                                                    >
                                                        {result.picture ? (
                                                            <img
                                                                src={result.picture}
                                                                alt={result.name}
                                                                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                <User size={16} color="var(--color-primary)" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{result.name}</div>
                                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{result.email}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </>
                                        ) : (
                                            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                                                No results found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                                                onClick={() => handleNotificationClick(notification)}
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
                            </div>
                        )}
                    </div>



                    {/* User Avatar & Menu */}
                    <div style={{ position: "relative" }}>
                        <div
                            onClick={() => {
                                setShowUserMenu(true);
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
                
                /* Mobile Responsiveness for TopNav */
                @media (max-width: 768px) {
                    .top-nav-header {
                        padding: 8px 12px !important;
                        height: 64px !important;
                        flex-wrap: nowrap !important;
                        gap: 8px !important;
                        align-content: center !important;
                    }
                    
                    /* Row 1: Title */
                    .top-nav-title {
                        width: auto !important;
                        min-width: 0 !important;
                        flex-basis: auto !important;
                        order: unset !important;
                        margin-bottom: 0 !important;
                    }

                    /* Hide Title when Search is Active */
                    .top-nav-title.mobile-search-active {
                        display: none !important;
                    }

                    /* Hide Desktop Search */
                    .top-nav-search {
                        display: none !important;
                    }
                    
                    /* Show Mobile Search Trigger */
                    .mobile-only-search {
                        display: block !important;
                    }

                    /* Actions (Mobile Search + Bell) */
                    .top-nav-actions {
                        order: unset !important;
                        width: auto !important;
                        display: flex !important;
                        align-items: center !important;
                        margin-left: auto !important; /* Push to right */
                        gap: 8px !important;
                    }
                    
                    /* Hide user avatar on mobile */
                    .user-avatar-btn {
                        display: none !important;
                    }
                    
                    /* Hide the ⌘K hint on mobile */
                    .search-shortcut {
                        display: none !important;
                    }
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

            {/* Sidebar Menu */}
            <SidebarMenu
                isOpen={showUserMenu}
                onClose={() => setShowUserMenu(false)}
            />
        </>
    );
}
