"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { artistSchema, type ArtistInput } from "@/schemas/artist";

interface ArtistFormProps {
  artist?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    equipment?: string | null;
    bankInfo?: string | null;
    notes?: string | null;
  };
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = !!artist;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: ArtistInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      equipment: formData.get("equipment") as string,
      bankInfo: formData.get("bankInfo") as string,
      notes: formData.get("notes") as string,
    };

    const parsed = artistSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    const url = isEdit ? `/api/artists/${artist.id}` : "/api/artists";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!result.success) {
      setError(result.error?.message || "保存に失敗しました");
      setLoading(false);
      return;
    }

    router.push("/artists");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "アーティスト編集" : "新規アーティスト"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">アーティスト名 *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={artist?.name}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={artist?.email || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={artist?.phone || ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment">機材情報</Label>
            <Textarea
              id="equipment"
              name="equipment"
              defaultValue={artist?.equipment || ""}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankInfo">銀行口座情報</Label>
            <Input
              id="bankInfo"
              name="bankInfo"
              defaultValue={artist?.bankInfo || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={artist?.notes || ""}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "更新" : "作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
