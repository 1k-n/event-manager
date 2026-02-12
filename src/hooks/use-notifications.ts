import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/notifications",
    fetcher,
    { refreshInterval: 30000 }
  );

  const markAsRead = async (notificationIds: string[]) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds }),
    });
    mutate();
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllAsRead: true }),
    });
    mutate();
  };

  return {
    notifications: data?.data?.notifications || [],
    unreadCount: data?.data?.unreadCount || 0,
    isLoading,
    error,
    mutate,
    markAsRead,
    markAllAsRead,
  };
}
