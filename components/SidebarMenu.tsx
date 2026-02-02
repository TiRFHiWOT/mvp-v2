"use client";

import { X, ArrowLeft, FileText, Gift, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface SidebarMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            router.push("/login");
        }
    };

    const handleGoToDashboard = () => {
        router.push("/dashboard");
        onClose();
    };

    if (!isOpen) return null;

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
                    zIndex: 998,
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity var(--transition-normal)",
                }}
            />

            {/* Drawer - Matching Figma exactly */}
            <div
                style={{
                    position: "fixed",
                    top: "12px",
                    left: "12px",
                    width: "240px",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                    zIndex: 999,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header with Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px",
                        borderBottom: "1px solid var(--border-light)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src="/logo.svg" alt="Logo" style={{ width: "28px", height: "28px" }} />
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                            }}
                        >
                            Message
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
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
                        <X size={18} />
                    </button>
                </div>

                {/* Menu Items */}
                <div style={{ padding: "8px" }}>
                    <button
                        onClick={handleGoToDashboard}
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
                        <ArrowLeft size={18} color="var(--text-secondary)" />
                        Go back to dashboard
                    </button>

                    <button
                        onClick={() => alert("Rename file feature")}
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
                        <FileText size={18} color="var(--text-secondary)" />
                        Rename file
                    </button>
                </div>

                {/* User Info Section with Credits - Matching Figma exactly */}
                {user && (
                    <div
                        style={{
                            margin: "0 8px",
                            padding: "16px 12px",
                            backgroundColor: "#F8F9FA",
                            borderRadius: "8px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                                marginBottom: "2px",
                            }}
                        >
                            {user.name || "testing2"}
                        </div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "12px",
                            }}
                        >
                            {user.email || "testing@email.com"}
                        </div>

                        {/* Credits Progress - Matching Figma */}
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "baseline",
                                    marginBottom: "6px",
                                }}
                            >
                                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                                    20 left
                                </span>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                    6h 24m
                                </span>
                            </div>
                            <div
                                style={{
                                    height: "6px",
                                    backgroundColor: "#E5E7EB",
                                    borderRadius: "100px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: "65%",
                                        backgroundColor: "var(--color-primary)",
                                        borderRadius: "100px",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: "6px",
                                }}
                            >
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                    5 of 25 used today
                                </span>
                                <span style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: 500 }}>
                                    +25 tomorrow
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Menu Items */}
                <div style={{ padding: "8px", borderTop: "1px solid var(--border-light)", marginTop: "8px" }}>
                    <button
                        onClick={() => alert("Win free credits feature")}
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
                        <Gift size={18} color="var(--text-secondary)" />
                        Win free credits
                    </button>

                    <button
                        onClick={() => alert("Theme style feature")}
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
                        <Palette size={18} color="var(--text-secondary)" />
                        Theme Style
                    </button>

                    <button
                        onClick={handleLogout}
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
                        <LogOut size={18} color="var(--text-secondary)" />
                        Log out
                    </button>
                </div>

                <style jsx>{`
          .menu-item:hover {
            background-color: #F3F4F6 !important;
          }
        `}</style>
            </div>
        </>
    );
}
