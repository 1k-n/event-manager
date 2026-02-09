"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TIMETABLE_TYPE_LABELS } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { Plus, Trash2, Clock, Pencil, GripVertical, Copy, Check } from "lucide-react";

interface TimetableViewProps {
  project: Record<string, unknown>;
  onUpdate: () => void;
}

function fmt(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatTimetableText(entries: Record<string, unknown>[]): string {
  if (entries.length === 0) return "";
  const lines: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const start = new Date(entry.startTime as string);
    const perfEnd = new Date(start.getTime() + (entry.performanceMinutes as number) * 60000);
    const changeover = (entry.changeoverMinutes as number) || 0;

    // アーティスト行
    lines.push(`${fmt(start)}\u2013${fmt(perfEnd)}\u3000${entry.artistName as string}`);

    // 転換（DJ）行
    if (changeover > 0) {
      const changeEnd = new Date(perfEnd.getTime() + changeover * 60000);
      lines.push(`${fmt(perfEnd)}\u2013${fmt(changeEnd)}\u3000DJ\uFF08${changeover}\u5206\uFF09`);
    }
  }

  return lines.join("\n");
}

export function TimetableView({ project, onUpdate }: TimetableViewProps) {
  const entries = (project.timetableEntries as Record<string, unknown>[]) || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addType, setAddType] = useState<string>("MAIN");
  const [copied, setCopied] = useState<string | null>(null);

  const mainEntries = entries.filter((e) => (e.type as string) !== "REHEARSAL");
  const rehearsalEntries = entries.filter((e) => (e.type as string) === "REHEARSAL");

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${project.id}/timetable/${deleteTarget}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteTarget(null);
    onUpdate();
  }

  function handleEdit(entry: Record<string, unknown>) {
    setEditTarget(entry);
    setDialogOpen(true);
  }

  function handleAdd(type: string) {
    setAddType(type);
    setEditTarget(null);
    setDialogOpen(true);
  }

  async function handleCopy(type: string) {
    const target = type === "REHEARSAL" ? rehearsalEntries : mainEntries;
    const text = formatTimetableText(target);
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  function renderEntries(typeEntries: Record<string, unknown>[], type: string) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{typeEntries.length}件</span>
          <div className="flex gap-2">
            {typeEntries.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => handleCopy(type)}>
                {copied === type ? (
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied === type ? "コピー済" : "コピー"}
              </Button>
            )}
            <Button size="sm" onClick={() => handleAdd(type)}>
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </div>
        </div>

        {typeEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>エントリーがまだありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {typeEntries.map((entry, index) => {
              const startTime = new Date(entry.startTime as string);
              const endMinutes = (entry.performanceMinutes as number) + (entry.changeoverMinutes as number);
              const endTime = new Date(startTime.getTime() + endMinutes * 60000);
              return (
                <Card key={entry.id as string}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{entry.artistName as string}</div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                          <span>{formatTime(entry.startTime as string)} - {formatTime(endTime.toISOString())}</span>
                          <span>出演 {entry.performanceMinutes as number}分</span>
                          {(entry.changeoverMinutes as number) > 0 && (
                            <span>転換 {entry.changeoverMinutes as number}分</span>
                          )}
                        </div>
                        {(entry.notes as string) ? (
                          <div className="text-xs text-muted-foreground mt-1">{entry.notes as string}</div>
                        ) : null}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(entry.id as string)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">タイムテーブル ({entries.length})</h3>

      <Tabs defaultValue="MAIN">
        <TabsList>
          <TabsTrigger value="MAIN" className="gap-1">
            本番
            {mainEntries.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{mainEntries.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="REHEARSAL" className="gap-1">
            リハーサル
            {rehearsalEntries.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{rehearsalEntries.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="MAIN">
          {renderEntries(mainEntries, "MAIN")}
        </TabsContent>
        <TabsContent value="REHEARSAL">
          {renderEntries(rehearsalEntries, "REHEARSAL")}
        </TabsContent>
      </Tabs>

      <TimetableFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={project.id as string}
        entry={editTarget}
        defaultType={addType}
        onSaved={onUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="エントリーを削除"
        description="このタイムテーブルエントリーを削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function TimetableFormDialog({
  open,
  onOpenChange,
  projectId,
  entry,
  defaultType,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  entry: Record<string, unknown> | null;
  defaultType: string;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState((entry?.type as string) || defaultType);
  const isEdit = !!entry;

  function getDefaultStartTime() {
    if (!entry?.startTime) return "";
    const d = new Date(entry.startTime as string);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      artistName: formData.get("artistName") as string,
      startTime: formData.get("startTime") as string,
      performanceMinutes: Number(formData.get("performanceMinutes")),
      changeoverMinutes: Number(formData.get("changeoverMinutes") || 0),
      type,
      notes: formData.get("notes") as string || undefined,
    };

    const url = isEdit
      ? `/api/projects/${projectId}/timetable/${entry.id}`
      : `/api/projects/${projectId}/timetable`;
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error?.message || "保存に失敗しました");
      return;
    }

    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v && entry) setType(entry.type as string || "MAIN"); if (v && !entry) setType(defaultType); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "エントリー編集" : "エントリー追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artistName">アーティスト名 *</Label>
              <Input id="artistName" name="artistName" defaultValue={(entry?.artistName as string) || ""} required />
            </div>
            <div className="space-y-2">
              <Label>種別</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIMETABLE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時刻 *</Label>
              <Input id="startTime" name="startTime" type="datetime-local" defaultValue={getDefaultStartTime()} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performanceMinutes">出演時間（分）*</Label>
              <Input id="performanceMinutes" name="performanceMinutes" type="number" min={1} defaultValue={(entry?.performanceMinutes as number) || 30} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="changeoverMinutes">転換時間（分）</Label>
            <Input id="changeoverMinutes" name="changeoverMinutes" type="number" min={0} defaultValue={(entry?.changeoverMinutes as number) || 0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea id="notes" name="notes" defaultValue={(entry?.notes as string) || ""} rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button type="submit" disabled={saving}>{saving ? "保存中..." : isEdit ? "更新" : "追加"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
