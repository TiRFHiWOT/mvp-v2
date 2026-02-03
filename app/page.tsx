"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePusher } from "@/hooks/usePusher";
import { ChatList } from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";

interface Session {
  id: string;
  user1: { id: string; name: string; picture?: string; email: string };
  user2: { id: string; name: string; picture?: string; email: string };
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { onlineUsers } = usePusher(user?.id || null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Handle URL query params for user selection
  useEffect(() => {
    const userIdFromUrl = searchParams.get('userId');
    console.log("Home useEffect: userIdFromUrl =", userIdFromUrl, "selectedUserId =", selectedUserId);
    if (userIdFromUrl && userIdFromUrl !== selectedUserId) {
      console.log("Setting selectedUserId to", userIdFromUrl);
      setSelectedUserId(userIdFromUrl);
      // Optional: Clear the query param so refreshing doesn't force this user
      // But keeping it allows sharing links to chats.
      // Let's keep it for now as "deep linking".
    }
  }, [searchParams, selectedUserId]);

  // Fetch session when selectedUserId changes
  useEffect(() => {
    if (!user || !selectedUserId) {
      setSession(null);
      return;
    }

    const createOrGetSession = async () => {
      try {
        setLoadingSession(true);
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user1Id: user.id, user2Id: selectedUserId }),
        });
        if (response.ok) {
          const data = await response.json();
          setSession(data.session);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSession(false);
      }
    };
    createOrGetSession();
  }, [user, selectedUserId]);

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-main)",
        }}
      >
        <Loader2 className="animate-spin" size={48} style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main
      style={{
        display: "flex",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--bg-main)",
      }}
    >
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Navigation */}
        <div className={selectedUserId ? "mobile-hidden" : ""}>
          <TopNav title="Message" />
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Chat List */}
          <div className={`${selectedUserId ? 'mobile-hidden' : 'mobile-visible'}`}>
            <ChatList
              currentUserId={user.id}
              activeId={selectedUserId}
              onSelectChat={setSelectedUserId}
            />
          </div>

          {/* Chat Window */}
          <div
            className={`${selectedUserId ? 'mobile-visible' : 'mobile-hidden'}`}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {selectedUserId && session ? (
              (() => {
                const recipient = session.user1.id === user.id ? session.user2 : session.user1;
                return (
                  <ChatWindow
                    sessionId={session.id}
                    recipientId={recipient.id}
                    recipientName={recipient.name}
                    recipientPicture={recipient.picture}
                    recipientOnline={onlineUsers.has(recipient.id)}
                    currentUser={user}
                    onBack={() => setSelectedUserId(null)}
                  />
                );
              })()
            ) : (
              <div
                className="mobile-hidden"
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-base)",
                }}
              >
                {loadingSession ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
                    <span>Loading chat...</span>
                  </div>
                ) : "Select a user to start chatting"}
              </div>
            )}

            {/* Mobile Back Button Overlay (Only visible on mobile when chat is open) */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-back-btn {
                        display: flex;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-back-btn {
                        display: none;
                    }
                }
             `}</style>
          </div>
        </div>
      </div>
    </main>
  );
}
