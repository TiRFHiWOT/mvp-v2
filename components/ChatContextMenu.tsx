"use client";

import { Check, BellOff } from "lucide-react";

interface ChatContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    onMarkAsUnread: () => void;
    onMute: () => void;
    isUnread?: boolean;
    isMuted?: boolean;
    hasMessages?: boolean;
}

export function ChatContextMenu({
    isOpen,
    onClose,
    position,
    onMarkAsUnread,
    onMute,
    isUnread = false,
    isMuted = false,
    hasMessages = true,
}: ChatContextMenuProps) {
    if (!isOpen) return null;

    const menuItems = [
        ...(hasMessages ? [{
            icon: Check,
            label: isUnread ? "Mark as read" : "Mark as unread",
            onClick: onMarkAsUnread
        }] : []),
        {
            icon: BellOff,
            label: isMuted ? "Unmute" : "Mute",
            onClick: onMute
        },
    ];

    const handleItemClick = (onClick: () => void) => {
        onClick();
        onClose();
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
                    zIndex: 998,
                }}
            />

            {/* Menu */}
            <div
                style={{
                    position: "fixed",
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    zIndex: 999,
                    minWidth: "180px",
                    padding: "8px",
                }}
            >
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => handleItemClick(item.onClick)}
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
                                transition: "all 0.15s ease",
                                textAlign: "left",
                            }}
                            className="menu-item"
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <style jsx>{`
                    .menu-item:hover {
                        background-color: #F3F4F6 !important;
                    }
                `}</style>
            </div>
        </>
    );
}
