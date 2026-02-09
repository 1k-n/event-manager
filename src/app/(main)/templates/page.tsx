"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useTemplates } from "@/hooks/use-templates";
import { TEMPLATE_TYPE_LABELS, TEMPLATE_VARIABLES } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { Plus, Trash2, Pencil, Mail, Eye, Copy, Check } from "lucide-react";

const typeColors: Record<string, string> = {
  OFFER: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  REMINDER: "bg-yellow-100 text-yellow-800",
  THANKS: "bg-purple-100 text-purple-800",
};

export default function TemplatesPage() {
  const { data, isLoading, mutate } = useTemplates();
  const templates = data?.data || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(t: Record<string, unknown>) {
    const text = `件名: ${t.subject}\n\n${t.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(t.id as string);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/templates/${deleteTarget}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    mutate();
  }

  function handleEdit(template: Record<string, unknown>) {
    setEditTarget(template);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">メールテンプレート</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">読み込み中...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>テンプレートがまだ登録されていません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t: Record<string, unknown>) => (
            <Card key={t.id as string} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{t.name as string}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={typeColors[t.type as string]} variant="secondary">
                        {TEMPLATE_TYPE_LABELS[t.type as string]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(t)}>
                      {copiedId === (t.id as string) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewTarget(t)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(t.id as string)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">件名: {t.subject as string}</p>
                  <p className="line-clamp-2">{t.body as string}</p>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  更新: {formatRelative(t.updatedAt as string)}
                  {(t.createdBy as Record<string, unknown>)?.name ? (
                    <span> / 作成者: {(t.createdBy as Record<string, unknown>).name as string}</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editTarget}
        onSaved={mutate}
      />

      {/* プレビュー */}
      <Dialog open={!!previewTarget} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>テンプレートプレビュー</DialogTitle>
          </DialogHeader>
          {previewTarget && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">件名</Label>
                <p className="font-medium">{previewTarget.subject as string}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">本文</Label>
                <pre className="whitespace-pre-wrap text-sm mt-1 p-3 bg-muted rounded-md">
                  {previewTarget.body as string}
                </pre>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">利用可能な変数</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <Badge key={v.key} variant="outline" className="text-xs">
                      {"{{" + v.key + "}}"} = {v.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="テンプレートを削除"
        description="このテンプレートを削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Record<string, unknown> | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState((template?.type as string) || "OFFER");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const isEdit = !!template;

  function insertVariable(varKey: string) {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const tag = `{{${varKey}}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.slice(0, start) + tag + value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + tag.length;
    textarea.focus();
    // trigger React's change detection
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, "value"
    )?.set;
    nativeInputValueSetter?.call(textarea, textarea.value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type,
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
    };

    const url = isEdit ? `/api/templates/${template.id}` : "/api/templates";
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
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v && template) setType(template.type as string); if (v && !template) setType("OFFER"); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "テンプレート編集" : "テンプレート作成"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">テンプレート名 *</Label>
              <Input id="name" name="name" defaultValue={(template?.name as string) || ""} required />
            </div>
            <div className="space-y-2">
              <Label>種別 *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">件名 *</Label>
            <Input id="subject" name="subject" defaultValue={(template?.subject as string) || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">本文 *</Label>
            <Textarea id="body" name="body" ref={bodyRef} defaultValue={(template?.body as string) || ""} rows={8} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">変数を挿入（クリックで本文に追加）</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  title={v.label}
                >
                  {"{{" + v.key + "}}"} <Plus className="ml-1 h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button type="submit" disabled={saving}>{saving ? "保存中..." : isEdit ? "更新" : "作成"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
