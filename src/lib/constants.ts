export const ARTIST_STATUS_LABELS: Record<string, string> = {
  CANDIDATE: "候補",
  OFFER_SENT: "オファー送信",
  AWAITING_REPLY: "返信待ち",
  CONFIRMED: "確定",
  DECLINED: "辞退",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "未請求",
  INVOICED: "請求済",
  PAID: "支払済",
  ON_HOLD: "保留",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  ACTIVE: "進行中",
  COMPLETED: "完了",
  CANCELLED: "中止",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "緊急",
};

export const BUDGET_TYPE_LABELS: Record<string, string> = {
  INCOME: "収入",
  EXPENSE: "支出",
};

export const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  OFFER: "オファー",
  CONFIRMED: "出演確定",
  REMINDER: "リマインド",
  THANKS: "お礼",
};

export const TIMETABLE_TYPE_LABELS: Record<string, string> = {
  REHEARSAL: "リハーサル",
  MAIN: "本番",
};

export const SETTLEMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "銀行振込",
  CASH: "現金",
  OTHER: "その他",
};

export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  CREATE: "作成",
  UPDATE: "更新",
  DELETE: "削除",
  STATUS_CHANGE: "ステータス変更",
};

export const ACTIVITY_ENTITY_LABELS: Record<string, string> = {
  PROJECT: "プロジェクト",
  ARTIST: "アーティスト",
  PROJECT_ARTIST: "出演アーティスト",
  TASK: "タスク",
  BUDGET_ITEM: "予算項目",
  TIMETABLE_ENTRY: "タイムテーブル",
  TICKET_TYPE: "チケット",
  MEMO: "メモ",
  FILE: "ファイル",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  TASK_ASSIGNED: "タスク割り当て",
  TASK_DUE_SOON: "タスク期限間近",
  ARTIST_STATUS_CHANGED: "アーティストステータス変更",
  PROJECT_STATUS_CHANGED: "プロジェクトステータス変更",
};

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const TEMPLATE_VARIABLES = [
  { key: "artist_name", label: "アーティスト名" },
  { key: "project_name", label: "プロジェクト名" },
  { key: "event_date", label: "イベント日" },
  { key: "venue_name", label: "会場名" },
  { key: "call_time", label: "集合時間" },
];
