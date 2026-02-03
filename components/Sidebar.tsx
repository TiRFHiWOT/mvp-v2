"use client";

import { Home, MessageSquare, Image, User, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { SidebarMenu } from "./SidebarMenu";
import { useRouter, usePathname } from "next/navigation";

export function Sidebar() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);


    const navItems = [
        {
            icon: Home,
            label: "Home",
            active: pathname === "/dashboard",
            onClick: () => router.push("/dashboard")
        },
        {
            icon: MessageSquare,
            label: "Messages",
            active: pathname === "/",
            onClick: () => router.push("/")
        },
        {
            icon: Sparkles,
            label: "AI Chat",
            active: pathname === "/ai-chat",
            onClick: () => router.push("/ai-chat")
        },
        {
            icon: Image,
            label: "Media",
            active: pathname === "/media",
            onClick: () => router.push("/media")
        },
    ];

    return (
        <aside
            className="flex flex-col items-center py-6 px-3"
            style={{
                width: 'var(--sidebar-width)',
                backgroundColor: 'var(--bg-sidebar)',
                height: '100vh',
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center justify-center mb-8 logo-container"
                style={{
                    width: '48px',
                    height: '48px',
                    cursor: 'pointer',
                }}
                onClick={() => setShowMenu(true)}
                title="Open Menu"
            >
                <img src="/logo.svg" alt="Logo" style={{ width: '48px', height: '48px' }} />
            </div>

            {/* Navigation Icons */}
            <nav className="flex flex-col items-center gap-2 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className="nav-icon-btn"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: item.active ? 'var(--bg-sidebar-hover)' : 'transparent',
                                color: item.active ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.6)',
                                transition: 'all var(--transition-fast)',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            title={item.label}
                        >
                            <Icon size={24} />
                        </button>
                    );
                })}
            </nav>

            {/* User Avatar - Opens Menu */}
            <button
                onClick={() => setShowMenu(true)}
                className="avatar avatar-lg mobile-nav-item"
                style={{
                    width: '48px',
                    height: '48px',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                    position: 'relative',
                }}
                title="Open menu"
            >
                {user?.picture ? (
                    <img src={user.picture} alt={user.name || 'User'} />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-white)',
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            borderRadius: 'var(--radius-full)',
                        }}
                    >
                        {user?.name?.[0]?.toUpperCase() || <User size={24} />}
                    </div>
                )}
            </button>

            <style jsx>{`
        .nav-icon-btn:hover {
          background-color: var(--bg-sidebar-hover) !important;
          color: var(--text-white) !important;
        }
        
        .avatar:hover {
          opacity: 0.8;
          transform: scale(1.05);
          transition: all var(--transition-fast);
        }

        /* Mobile Bottom Nav Styles */
        @media (max-width: 768px) {
          aside {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 60px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-around !important; /* Distribute all items evenly */
            padding: 0 8px !important; /* Small padding on edges */
            z-index: 1000;
            background-color: var(--bg-sidebar) !important;
            border-top: 1px solid var(--border-light) !important;
            box-shadow: 0 -1px 3px rgba(0,0,0,0.05);
          }
          
          .logo-container {
            display: none !important;
          }
          
          /* "Flatten" the nav hierarchy so buttons participate in aside's flex layout */
          nav {
            display: contents !important;
          }
          
          /* Remove gap since justify-content handles spacing */
          nav > button {
             margin: 0 !important;
          }
        }
      `}</style>

            {/* Sidebar Menu */}
            <SidebarMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
        </aside >
    );
}
