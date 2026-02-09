"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projectSchema, type ProjectInput } from "@/schemas/project";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

interface ProjectFormProps {
  project?: {
    id: string;
    name: string;
    description?: string | null;
    eventDate?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    status: string;
  };
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = !!project;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: ProjectInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      eventDate: formData.get("eventDate") as string,
      venueName: formData.get("venueName") as string,
      venueAddress: formData.get("venueAddress") as string,
      status: formData.get("status") as ProjectInput["status"],
    };

    const parsed = projectSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    const url = isEdit ? `/api/projects/${project.id}` : "/api/projects";
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

    router.push(isEdit ? `/projects/${project.id}` : "/projects");
    router.refresh();
  }

  const eventDateValue = project?.eventDate
    ? new Date(project.eventDate).toISOString().split("T")[0]
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "プロジェクト編集" : "新規プロジェクト"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">プロジェクト名 *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description || ""}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">開催日</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                defaultValue={eventDateValue}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select name="status" defaultValue={project?.status || "DRAFT"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venueName">会場名</Label>
              <Input
                id="venueName"
                name="venueName"
                defaultValue={project?.venueName || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venueAddress">会場住所</Label>
              <Input
                id="venueAddress"
                name="venueAddress"
                defaultValue={project?.venueAddress || ""}
              />
            </div>
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
