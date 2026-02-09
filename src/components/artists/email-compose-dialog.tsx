"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { useTemplates } from "@/hooks/use-templates";
import { TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { Copy, Check, Send } from "lucide-react";

interface EmailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Record<string, unknown>;
  artist: Record<string, unknown>;
  projectArtist: Record<string, unknown>;
}

function replaceVariables(
  text: string,
  vars: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function EmailComposeDialog({
  open,
  onOpenChange,
  project,
  artist,
  projectArtist,
}: EmailComposeDialogProps) {
  const { data: templateData } = useTemplates();
  const templates = (templateData?.data || []) as Record<string, unknown>[];
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const mailtoRef = useRef<HTMLAnchorElement>(null);

  const variables: Record<string, string> = {
    artist_name: artist.name as string || "",
    project_name: project.name as string || "",
    event_date: project.eventDate
      ? new Date(project.eventDate as string).toLocaleDateString("ja-JP")
      : "未定",
    venue_name: (project.venueName as string) || "未定",
    call_time: "",
  };

  useEffect(() => {
    if (!selectedTemplateId) return;
    const tmpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tmpl) return;
    setSubject(replaceVariables(tmpl.subject as string, variables));
    setBody(replaceVariables(tmpl.body as string, variables));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]);

  useEffect(() => {
    if (open) {
      setSelectedTemplateId("");
      setSubject("");
      setBody("");
      setCopied(false);
    }
  }, [open]);

  const artistEmail = artist.email as string;

  async function handleCopy() {
    await navigator.clipboard.writeText(`件名: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMailto() {
    if (mailtoRef.current) {
      mailtoRef.current.click();
    }
  }

  // mailto URL を構築
  const mailtoUrl = artistEmail
    ? `mailto:${encodeURIComponent(artistEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>メール作成 - {artist.name as string}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>テンプレート選択</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="テンプレートを選択..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id as string} value={t.id as string}>
                    {t.name as string} ({TEMPLATE_TYPE_LABELS[t.type as string]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>宛先</Label>
            <Input value={artistEmail || "メール未登録"} disabled />
          </div>

          <div className="space-y-2">
            <Label>件名</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="件名を入力..."
            />
          </div>

          <div className="space-y-2">
            <Label>本文</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="テンプレートを選択すると自動入力されます"
            />
          </div>

          {/* 置換プレビュー */}
          {selectedTemplateId && (
            <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
              <p className="font-medium mb-1">変数の置換結果:</p>
              {Object.entries(variables).map(([key, value]) => (
                <div key={key}>
                  {`{{${key}}}`} → <span className="text-foreground">{value || "(空)"}</span>
                </div>
              ))}
            </div>
          )}

          {/* 非表示のaタグ（mailto用） */}
          {artistEmail && (
            <a
              ref={mailtoRef}
              href={mailtoUrl}
              className="hidden"
              aria-hidden="true"
            >
              メール
            </a>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy} disabled={!subject && !body}>
              {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "コピー済" : "コピー"}
            </Button>
            {artistEmail ? (
              <Button type="button" onClick={handleMailto} disabled={!subject}>
                <Send className="mr-2 h-4 w-4" />
                メールを送る
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
