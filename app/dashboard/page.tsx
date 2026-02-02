"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { MessageSquare, Users, Image, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

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
            value: "1,234",
            color: "var(--color-primary)",
            bgColor: "rgba(99, 102, 241, 0.1)",
        },
        {
            icon: Users,
            label: "Contacts",
            value: "48",
            color: "#10B981",
            bgColor: "rgba(16, 185, 129, 0.1)",
        },
        {
            icon: Image,
            label: "Media Files",
            value: "156",
            color: "#F59E0B",
            bgColor: "rgba(245, 158, 11, 0.1)",
        },
        {
            icon: FileText,
            label: "Documents",
            value: "23",
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
                    <div style={{ marginBottom: "var(--spacing-8)" }}>
                        <h1
                            style={{
                                fontSize: "var(--font-size-2xl)",
                                fontWeight: "var(--font-weight-bold)",
                                color: "var(--text-primary)",
                                marginBottom: "var(--spacing-2)",
                            }}
                        >
                            Welcome back, {user.name}!
                        </h1>
                        <p style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)" }}>
                            Here's what's happening with your messages today.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "var(--spacing-6)",
                            marginBottom: "var(--spacing-8)",
                        }}
                    >
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    style={{
                                        backgroundColor: "var(--bg-surface)",
                                        borderRadius: "var(--radius-lg)",
                                        padding: "var(--spacing-6)",
                                        border: "1px solid var(--border-light)",
                                        transition: "all var(--transition-fast)",
                                    }}
                                    className="stat-card"
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "var(--radius-md)",
                                            backgroundColor: stat.bgColor,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "var(--spacing-4)",
                                        }}
                                    >
                                        <Icon size={24} color={stat.color} />
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "var(--font-size-sm)",
                                            color: "var(--text-secondary)",
                                            marginBottom: "var(--spacing-2)",
                                        }}
                                    >
                                        {stat.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "var(--font-size-2xl)",
                                            fontWeight: "var(--font-weight-bold)",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: "var(--spacing-8)" }}>
                        <h2
                            style={{
                                fontSize: "var(--font-size-xl)",
                                fontWeight: "var(--font-weight-semibold)",
                                color: "var(--text-primary)",
                                marginBottom: "var(--spacing-4)",
                            }}
                        >
                            Quick Actions
                        </h2>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: "var(--spacing-4)",
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
                                            borderRadius: "var(--radius-lg)",
                                            padding: "var(--spacing-5)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "var(--spacing-4)",
                                            cursor: "pointer",
                                            transition: "all var(--transition-fast)",
                                            textAlign: "left",
                                        }}
                                        className="action-card"
                                    >
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "var(--radius-md)",
                                                backgroundColor: "rgba(99, 102, 241, 0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon size={24} color="var(--color-primary)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: "var(--font-size-base)",
                                                    fontWeight: "var(--font-weight-semibold)",
                                                    color: "var(--text-primary)",
                                                    marginBottom: "var(--spacing-1)",
                                                }}
                                            >
                                                {action.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "var(--font-size-sm)",
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

                    {/* Recent Activity */}
                    <div>
                        <h2
                            style={{
                                fontSize: "var(--font-size-xl)",
                                fontWeight: "var(--font-weight-semibold)",
                                color: "var(--text-primary)",
                                marginBottom: "var(--spacing-4)",
                            }}
                        >
                            Recent Activity
                        </h2>
                        <div
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border-light)",
                                borderRadius: "var(--radius-lg)",
                                padding: "var(--spacing-6)",
                            }}
                        >
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "var(--spacing-8)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <MessageSquare size={48} color="var(--text-muted)" style={{ margin: "0 auto var(--spacing-4)" }} />
                                <p style={{ fontSize: "var(--font-size-base)" }}>
                                    No recent activity to display
                                </p>
                                <p style={{ fontSize: "var(--font-size-sm)", marginTop: "var(--spacing-2)" }}>
                                    Start a conversation to see your activity here
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .action-card:hover {
                    border-color: var(--color-primary);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                }
            `}</style>
        </div>
    );
}
