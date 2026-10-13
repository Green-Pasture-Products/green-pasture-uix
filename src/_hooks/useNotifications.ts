import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/_redux/store";
import { useLiveEvent } from "@/_hooks/useLiveEvent";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export function useNotifications() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const axiosInstance = (await import("@/_utils/axiosInstance")).default;
      const res = await axiosInstance.get("notifications?limit=20");
      const data = res.data?.data;
      setNotifications(data?.notifications ?? []);
      setUnreadCount(data?.unreadCount ?? 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const axiosInstance = (await import("@/_utils/axiosInstance")).default;
      await axiosInstance.patch(`notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const axiosInstance = (await import("@/_utils/axiosInstance")).default;
      await axiosInstance.patch("notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  // Live: a new notification arrives, or an announcement is published/changed.
  useLiveEvent<Notification>(
    "new-notification",
    (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    },
    isAuthenticated,
  );
  useLiveEvent("announcement-changed", () => void fetchNotifications(), isAuthenticated);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
