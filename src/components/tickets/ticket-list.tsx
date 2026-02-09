"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Ticket, Pencil } from "lucide-react";

interface TicketListProps {
  project: Record<string, unknown>;
  onUpdate: () => void;
}

export function TicketList({ project, onUpdate }: TicketListProps) {
  const tickets = (project.ticketTypes as Record<string, unknown>[]) || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalRevenue = tickets.reduce(
    (sum, t) => sum + (t.price as number) * (t.quantity as number),
    0
  );
  const totalQuantity = tickets.reduce((sum, t) => sum + (t.quantity as number), 0);

  async function handleQuantityChange(ticketId: string, quantity: string) {
    const value = Math.max(0, parseInt(quantity, 10) || 0);
    await fetch(`/api/projects/${project.id}/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: value }),
    });
    onUpdate();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${project.id}/tickets/${deleteTarget}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteTarget(null);
    onUpdate();
  }

  function handleEdit(ticket: Record<string, unknown>) {
    setEditTarget(ticket);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">チケット ({tickets.length}種類)</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          種類を追加
        </Button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">チケット種類</div>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">合計枚数</div>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-muted-foreground">合計売上見込</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>チケットがまだ設定されていません</p>
            <Button variant="outline" className="mt-4" onClick={handleAdd}>
              チケット種類を追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>チケット名</TableHead>
              <TableHead className="text-right">単価</TableHead>
              <TableHead className="text-right w-32">枚数</TableHead>
              <TableHead className="text-right">小計</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const subtotal = (ticket.price as number) * (ticket.quantity as number);
              return (
                <TableRow key={ticket.id as string}>
                  <TableCell className="font-medium">{ticket.name as string}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ticket.price as number)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      className="h-8 w-24 text-right ml-auto"
                      defaultValue={ticket.quantity as number}
                      onBlur={(e) =>
                        handleQuantityChange(ticket.id as string, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(subtotal)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(ticket)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ticket.id as string)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>合計</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">{totalQuantity.toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}

      <div className="text-xs text-muted-foreground">
        ※ チケットの合計金額は予算の収入に自動的に反映されます
      </div>

      <TicketFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={project.id as string}
        ticket={editTarget}
        onSaved={onUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="チケットを削除"
        description="このチケットを削除しますか？予算の連携も更新されます。"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function TicketFormDialog({
  open,
  onOpenChange,
  projectId,
  ticket,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  ticket: Record<string, unknown> | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!ticket;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
    };

    // 新規追加時は枚数0で作成、編集時は枚数も送信可能
    if (isEdit) {
      data.quantity = Number(formData.get("quantity"));
    } else {
      data.quantity = 0;
    }

    const url = isEdit
      ? `/api/projects/${projectId}/tickets/${ticket.id}`
      : `/api/projects/${projectId}/tickets`;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "チケット編集" : "チケット種類を追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">チケット名 *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={(ticket?.name as string) || ""}
              placeholder="例: 一般チケット、VIPチケット"
              required
            />
          </div>
          <div className={isEdit ? "grid grid-cols-2 gap-4" : ""}>
            <div className="space-y-2">
              <Label htmlFor="price">単価（円） *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                defaultValue={(ticket?.price as number) ?? ""}
                required
              />
            </div>
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="quantity">枚数</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={(ticket?.quantity as number) ?? 0}
                />
              </div>
            )}
          </div>
          {!isEdit && (
            <p className="text-xs text-muted-foreground">
              ※ 枚数は追加後に一覧から設定できます
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "保存中..." : isEdit ? "更新" : "追加"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
