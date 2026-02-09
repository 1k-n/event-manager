import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

export function apiResponse<T>(data: T) {
  return Response.json({ success: true, data });
}

export function apiError(code: string, message: string, status = 400) {
  return Response.json(
    { success: false, error: { code, message } },
    { status }
  );
}
