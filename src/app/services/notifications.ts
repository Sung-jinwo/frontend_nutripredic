import { toast as sonner } from "sonner";

export type NotificationKind = "success" | "error" | "info";
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  message: string;
  createdAt: string;
  read: boolean;
}

let scope: number | null = null;
let items: AppNotification[] = [];
const listeners = new Set<() => void>();
const recent = new Map<string, number>();
const storageKey = () => `nutripredict:notifications:${scope}`;

function publish() {
  if (scope !== null) {
    try { localStorage.setItem(storageKey(), JSON.stringify(items)); } catch { /* Storage may be unavailable. */ }
  }
  listeners.forEach(listener => listener());
}

export function setNotificationUser(userId: number | null) {
  if (scope === userId) return;
  sonner.dismiss();
  scope = userId;
  items = [];
  recent.clear();
  if (scope !== null) {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey()) ?? "[]");
      if (Array.isArray(stored)) items = stored.filter((item): item is AppNotification =>
        item && typeof item.id === "string" && typeof item.message === "string" &&
        ["success", "error", "info"].includes(item.kind) && typeof item.read === "boolean" &&
        typeof item.createdAt === "string" && Number.isFinite(Date.parse(item.createdAt))).slice(0, 100);
    } catch { /* Ignore invalid or unavailable storage. */ }
  }
  publish();
}

function notify(kind: NotificationKind, message: string, options?: { id?: string | number }) {
  const key = `${kind}:${message}`;
  const now = Date.now();
  if (now - (recent.get(key) ?? 0) < 8000) return;
  // Some pages add context to an API error already shown by the HTTP client.
  if (kind === "error" && items.some(item => item.kind === kind &&
    now - Date.parse(item.createdAt) < 8000 &&
    (message.includes(item.message) || item.message.includes(message)))) return;
  for (const [previousKey, timestamp] of recent) if (now - timestamp >= 8000) recent.delete(previousKey);
  recent.set(key, now);
  const id = globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2)}`;
  items = [{ id, kind, message, createdAt: new Date(now).toISOString(), read: false }, ...items].slice(0, 100);
  publish();
  return sonner[kind](message, { id: options?.id ?? id });
}

export const toast = {
  success: (message: string, options?: { id?: string | number }) => notify("success", message, options),
  error: (message: string, options?: { id?: string | number }) => notify("error", message, options),
  info: (message: string, options?: { id?: string | number }) => notify("info", message, options),
};

export const notificationStore = {
  get: () => items,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  markAllRead: () => { items = items.map(item => ({ ...item, read: true })); publish(); },
  clear: () => { items = []; publish(); },
  remove: (id: string) => { items = items.filter(item => item.id !== id); publish(); },
};
