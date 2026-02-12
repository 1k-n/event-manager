"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">通知</h1>
          {unreadCount > 0 && (
            <Badge>{unreadCount}件の未読</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            すべて既読にする
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">通知一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              通知はありません
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification: Notification) => (
                <button
                  key={notification.id}
                  className={`w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors ${
                    !notification.isRead ? "bg-muted/50 border-primary/20" : ""
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                    <div className={!notification.isRead ? "" : "ml-5"}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
