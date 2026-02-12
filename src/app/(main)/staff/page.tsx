"use client";

import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsersRound } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理者",
  STAFF: "スタッフ",
  VIEWER: "閲覧者",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  STAFF: "bg-blue-100 text-blue-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
}

export default function StaffPage() {
  const { users, isLoading } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UsersRound className="h-6 w-6" />
        <h1 className="text-2xl font-bold">スタッフ一覧</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            登録メンバー ({users.length}名)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              読み込み中...
            </p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              メンバーがいません
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {user.name || "未設定"}
                      </p>
                      <Badge
                        className={ROLE_COLORS[user.role] || ""}
                        variant="secondary"
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    登録: {format(new Date(user.createdAt), "yyyy/MM/dd", { locale: ja })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
