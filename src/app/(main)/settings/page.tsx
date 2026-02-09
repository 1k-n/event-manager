"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { Settings, User, Lock, Shield } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理者",
  STAFF: "スタッフ",
  VIEWER: "閲覧者",
};

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR("/api/settings", fetcher);
  const user = data?.data;

  if (isLoading) {
    return <div className="text-muted-foreground">読み込み中...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>ユーザー情報の読み込みに失敗しました</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* アカウント情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            アカウント情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">ロール</span>
            <Badge variant="secondary">{ROLE_LABELS[user.role] || user.role}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">登録日</span>
            <span className="text-sm">{formatDate(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* プロフィール編集 */}
      <ProfileForm user={user} onSaved={mutate} />

      {/* パスワード変更 */}
      <PasswordForm />
    </div>
  );
}

function ProfileForm({
  user,
  onSaved,
}: {
  user: Record<string, unknown>;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error?.message || "更新に失敗しました");
      return;
    }

    setSuccess("プロフィールを更新しました");
    onSaved();
    setTimeout(() => setSuccess(""), 3000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          プロフィール
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
              {success}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              name="name"
              defaultValue={(user.name as string) || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={(user.email as string) || ""}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "保存中..." : "プロフィールを更新"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      setSaving(false);
      return;
    }

    const data = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword,
    };

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error?.message || "パスワードの変更に失敗しました");
      return;
    }

    setSuccess("パスワードを変更しました");
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSuccess(""), 3000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4" />
          パスワード変更
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
              {success}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">現在のパスワード</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={6}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "変更中..." : "パスワードを変更"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
