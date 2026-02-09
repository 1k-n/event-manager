"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { BUDGET_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Wallet, Pencil, TrendingUp, TrendingDown } from "lucide-react";

interface BudgetSummaryProps {
  project: Record<string, unknown>;
  onUpdate: () => void;
}

export function BudgetSummary({ project, onUpdate }: BudgetSummaryProps) {
  const items = (project.budgetItems as Record<string, unknown>[]) || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const incomeItems = items.filter((i) => i.type === "INCOME");
  const expenseItems = items.filter((i) => i.type === "EXPENSE");
  const totalIncome = incomeItems.reduce((s, i) => s + (i.amount as number), 0);
  const totalExpense = expenseItems.reduce((s, i) => s + (i.amount as number), 0);
  const balance = totalIncome - totalExpense;

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/projects/${project.id}/budget/${deleteTarget}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setDeleteTarget(null);
    onUpdate();
  }

  function handleEdit(item: Record<string, unknown>) {
    setEditTarget(item);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function renderTable(tableItems: Record<string, unknown>[], type: string) {
    if (tableItems.length === 0) return null;
    const total = tableItems.reduce((s, i) => s + (i.amount as number), 0);
    return (
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          {type === "INCOME" ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          {BUDGET_TYPE_LABELS[type]} ({formatCurrency(total)})
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>カテゴリ</TableHead>
              <TableHead>説明</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead className="w-16">種別</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableItems.map((item) => (
              <TableRow key={item.id as string}>
                <TableCell className="font-medium">{item.category as string}</TableCell>
                <TableCell className="text-muted-foreground">
                  {(item.description as string) || "-"}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount as number)}</TableCell>
                <TableCell>
                  <Badge variant={item.isEstimate ? "outline" : "secondary"}>
                    {item.isEstimate ? "見積" : "確定"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(item.id as string)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">予算 ({items.length})</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          追加
        </Button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">収入合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">支出合計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">収支</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>予算項目がまだ作成されていません</p>
            <Button variant="outline" className="mt-4" onClick={handleAdd}>
              予算項目を追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {renderTable(incomeItems, "INCOME")}
          {renderTable(expenseItems, "EXPENSE")}
        </div>
      )}

      <BudgetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={project.id as string}
        item={editTarget}
        onSaved={onUpdate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="予算項目を削除"
        description="この予算項目を削除しますか？"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function BudgetFormDialog({
  open,
  onOpenChange,
  projectId,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  item: Record<string, unknown> | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState((item?.type as string) || "EXPENSE");
  const [isEstimate, setIsEstimate] = useState(item?.isEstimate !== false);
  const isEdit = !!item;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type,
      category: formData.get("category") as string,
      description: formData.get("description") as string || undefined,
      amount: Number(formData.get("amount")),
      isEstimate,
    };

    const url = isEdit
      ? `/api/projects/${projectId}/budget/${item.id}`
      : `/api/projects/${projectId}/budget`;
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
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v && item) { setType(item.type as string); setIsEstimate(item.isEstimate !== false); } if (v && !item) { setType("EXPENSE"); setIsEstimate(true); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "予算項目編集" : "予算項目追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <div className="space-y-2">
            <Label>種別 *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BUDGET_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ *</Label>
              <Input id="category" name="category" defaultValue={(item?.category as string) || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">金額 *</Label>
              <Input id="amount" name="amount" type="number" min={0} defaultValue={(item?.amount as number) || ""} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Input id="description" name="description" defaultValue={(item?.description as string) || ""} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isEstimate"
              checked={isEstimate}
              onCheckedChange={(v) => setIsEstimate(v === true)}
            />
            <Label htmlFor="isEstimate" className="text-sm">見積もり（未確定）</Label>
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
