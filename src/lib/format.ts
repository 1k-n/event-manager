import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return format(new Date(date), "yyyy/MM/dd", { locale: ja });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return format(new Date(date), "yyyy/MM/dd HH:mm", { locale: ja });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return format(new Date(date), "HH:mm", { locale: ja });
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja });
}

export function isDueSoon(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const threeDaysFromNow = addDays(now, 3);
  return isBefore(d, threeDaysFromNow) && isAfter(d, now);
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return isBefore(new Date(date), new Date());
}
