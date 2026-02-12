"use client";

import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ENTITY_LABELS,
} from "@/lib/constants";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";

interface Activity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  projectId: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  project: { id: string; name: string } | null;
}

const actionIcons: Record<string, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  STATUS_CHANGE: ArrowRightLeft,
};

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500",
  UPDATE: "bg-blue-500",
  DELETE: "bg-red-500",
  STATUS_CHANGE: "bg-yellow-500",
};

interface ActivityTimelineProps {
  activities: Activity[];
  showProject?: boolean;
}

export function ActivityTimeline({ activities, showProject = true }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        アクティビティはまだありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = actionIcons[activity.action] || Pencil;
        const colorClass = actionColors[activity.action] || "bg-gray-500";

        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 w-px bg-border" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={activity.user.image || ""} />
                  <AvatarFallback className="text-[10px]">
                    {activity.user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {activity.user.name || "不明"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {ACTIVITY_ACTION_LABELS[activity.action] || activity.action}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {ACTIVITY_ENTITY_LABELS[activity.entityType] || activity.entityType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </span>
                {showProject && activity.project && (
                  <span className="text-xs text-muted-foreground">
                    · {activity.project.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
