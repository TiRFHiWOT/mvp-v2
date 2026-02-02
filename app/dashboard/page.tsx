"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { MessageSquare, Users, Image, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [statsData, setStatsData] = useState({
        messages: 0,
        media: 0,
        documents: 0,
        contacts: 0
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchStats();
        }
    }, [user, loading, router]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("/api/dashboard/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStatsData(data);
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "var(--bg-main)",
            }}>
                <Loader2 className="animate-spin" size={40} style={{ color: "var(--color-primary)" }} />
            </div>
        );
    }

    if (!user) return null;

    const stats = [
        {
            icon: MessageSquare,
            label: "Total Messages",
            value: statsData.messages.toLocaleString(),
            color: "var(--color-primary)",
            bgColor: "rgba(99, 102, 241, 0.1)",
        },
        {
            icon: Users,
            label: "Active Chats",
            value: statsData.contacts.toLocaleString(),
            color: "#10B981",
            bgColor: "rgba(16, 185, 129, 0.1)",
        },
        {
            icon: Image,
            label: "Media Files",
            value: statsData.media.toLocaleString(),
            color: "#F59E0B",
            bgColor: "rgba(245, 158, 11, 0.1)",
        },
        {
            icon: FileText,
            label: "Documents",
            value: statsData.documents.toLocaleString(),
            color: "#8B5CF6",
            bgColor: "rgba(139, 92, 246, 0.1)",
        },
    ];

    const quickActions = [
        {
            label: "New Message",
            description: "Start a conversation",
            icon: MessageSquare,
            onClick: () => router.push("/"),
        },
        {
            label: "View Media",
            description: "Browse your files",
            icon: Image,
            onClick: () => router.push("/media"),
        },
    ];

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-main)" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <TopNav title="Dashboard" />

                <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-8)" }}>
                    {/* Welcome Header */}
                    <div style={{ marginBottom: "var(--spacing-10)" }}>
                        <h1
                            style={{
                                fontSize: "32px",
                                fontWeight: "800",
                                color: "var(--text-primary)",
                                marginBottom: "8px",
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h1>
                        <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "600px" }}>
                            Here's an overview of your communication activity.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "24px",
                            marginBottom: "48px",
                        }}
                    >
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    style={{
                                        backgroundColor: "var(--bg-surface)",
                                        borderRadius: "16px",
                                        padding: "24px",
                                        border: "1px solid var(--border-light)",
                                        transition: "all 0.2s ease-in-out",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        height: "160px",
                                    }}
                                    className="stat-card"
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {stat.label}
                                        </div>
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "12px",
                                                backgroundColor: stat.bgColor,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Icon size={20} color={stat.color} />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "36px",
                                            fontWeight: "800",
                                            color: "var(--text-primary)",
                                            letterSpacing: "-1px",
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: "48px" }}>
                        <h2
                            style={{
                                fontSize: "20px",
                                fontWeight: "700",
                                color: "var(--text-primary)",
                                marginBottom: "20px",
                            }}
                        >
                            Quick Actions
                        </h2>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: "20px",
                            }}
                        >
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.label}
                                        onClick={action.onClick}
                                        style={{
                                            backgroundColor: "var(--bg-surface)",
                                            border: "1px solid var(--border-light)",
                                            borderRadius: "16px",
                                            padding: "24px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "20px",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            textAlign: "left",
                                            width: "100%",
                                        }}
                                        className="action-card"
                                    >
                                        <div
                                            style={{
                                                width: "56px",
                                                height: "56px",
                                                borderRadius: "16px",
                                                backgroundColor: "var(--bg-main)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                border: "1px solid var(--border-light)",
                                            }}
                                        >
                                            <Icon size={24} color="var(--text-primary)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: "16px",
                                                    fontWeight: "700",
                                                    color: "var(--text-primary)",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                {action.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "14px",
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {action.description}
                                            </div>
                                        </div>
                                        <ArrowRight size={20} color="var(--text-muted)" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .stat-card:hover {
                    border-color: var(--color-primary);
                    background-color: var(--bg-surface-hover);
                }

                .action-card:hover {
                    border-color: var(--color-primary);
                    background-color: var(--bg-surface-hover);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
