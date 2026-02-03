"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePusher } from "./usePusher";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "./useAuth";

export function useUnreadMessages(currentUserId: string | null) {
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map()
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { subscribeToChannel, subscribeToSession, onMessage } = usePusher(currentUserId || null);
  const currentChatUserIdRef = useRef<string | null>(null);
  const sessionSubscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const { user } = useAuth();

  // Track which chat is currently open (by userId, not sessionId)
  useEffect(() => {
    const match = pathname?.match(/\/chat\/([^/]+)/);
    const userIdFromUrl = searchParams.get('userId');
    currentChatUserIdRef.current = match ? match[1] : userIdFromUrl;

    // Clear unread count for the currently open chat
    if (currentChatUserIdRef.current) {
      setUnreadCounts((prev) => {
        const next = new Map(prev);
        next.delete(currentChatUserIdRef.current!);
        return next;
      });
    }
  }, [pathname, searchParams]);

  // Subscribe to all session channels for the current user
  useEffect(() => {
    if (!currentUserId || !subscribeToSession || !user) return;

    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 1. Fetch sessions
        const sessionsResponse = await fetch("/api/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sessionsResponse.ok) {
          const data = await sessionsResponse.json();
          const sessions = data.sessions || [];

          sessions.forEach((session: any) => {
            const sessionId = session.id;
            if (sessionSubscriptionsRef.current.has(sessionId)) return;
            const cleanup = subscribeToSession(sessionId);
            sessionSubscriptionsRef.current.set(sessionId, cleanup);
          });
        }

        // 2. Fetch unread notifications to seed counts
        const notifResponse = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (notifResponse.ok) {
          const allNotifs: any[] = await notifResponse.json();
          const newCounts = new Map<string, number>();

          allNotifs.forEach((n) => {
            if (!n.read && n.type === "message" && n.senderId) {
              newCounts.set(n.senderId, (newCounts.get(n.senderId) || 0) + 1);
            }
          });

          setUnreadCounts(newCounts);
        }

      } catch (error) {
        console.error("Error fetching initial data for unread messages:", error);
      }
    };

    fetchInitialData();

    // Cleanup on unmount
    return () => {
      sessionSubscriptionsRef.current.forEach((cleanup) => cleanup());
      sessionSubscriptionsRef.current.clear();
    };
  }, [currentUserId, subscribeToSession, user]);

  // Listen for messages from Pusher via onMessage and notification channel
  useEffect(() => {
    if (!currentUserId || !onMessage || !subscribeToChannel) return;

    // 1. Listen for messages on session channels the user is already subscribed to
    const cleanupMessage = onMessage("message", (data: any) => {
      if (
        data.senderId &&
        data.recipientId === currentUserId &&
        data.senderId !== currentChatUserIdRef.current &&
        data.senderId !== currentUserId
      ) {
        setUnreadCounts((prev) => {
          const next = new Map(prev);
          const currentCount = next.get(data.senderId) || 0;
          next.set(data.senderId, currentCount + 1);
          return next;
        });
      }
    });

    // 2. Listen for notifications on the user's private channel
    // This catches messages from new sessions or sessions not yet subscribed to
    const unsubscribeNotifications = subscribeToChannel(
      `private-user-${currentUserId}`,
      "new-notification",
      (data: any) => {
        // If it's a message and not from the currently open chat
        if (
          data.type === "message" &&
          data.senderId &&
          data.senderId !== currentChatUserIdRef.current &&
          data.senderId !== currentUserId
        ) {
          setUnreadCounts((prev) => {
            const next = new Map(prev);
            const currentCount = next.get(data.senderId) || 0;
            // Only increment if we don't already have this message from the session channel
            // (Pusher might send both if we are subscribed to both, but usually notification 
            // is for the recipient only)
            next.set(data.senderId, currentCount + 1);
            return next;
          });
        }
      }
    );

    return () => {
      cleanupMessage();
      unsubscribeNotifications();
    };
  }, [currentUserId, onMessage, subscribeToChannel]);

  const getUnreadCount = useCallback(
    (userId: string) => {
      return unreadCounts.get(userId) || 0;
    },
    [unreadCounts]
  );

  const clearUnreadCount = useCallback((userId: string) => {
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const markAsUnread = useCallback((userId: string) => {
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      next.set(userId, 1);
      return next;
    });
  }, []);

  return {
    unreadCounts,
    getUnreadCount,
    clearUnreadCount,
    markAsUnread,
  };
}
