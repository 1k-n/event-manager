"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
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

export function NotificationBell() {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">通知</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={markAllAsRead}
            >
              すべて既読
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              通知はありません
            </p>
          ) : (
            notifications.slice(0, 20).map((notification: Notification) => (
              <button
                key={notification.id}
                className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-muted transition-colors ${
                  !notification.isRead ? "bg-muted/50" : ""
                }`}
                onClick={() => handleClick(notification)}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div className={!notification.isRead ? "" : "ml-4"}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-0.5">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => router.push("/notifications")}
            >
              すべての通知を表示
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
