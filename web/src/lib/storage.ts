/**
 * Namespaced localStorage wrapper with Zod schema validation.
 * All keys are prefixed with "frontierllm:" for namespace isolation.
 *
 * Supported keys (spec §5):
 *   frontierllm:theme:v1
 *   frontierllm:reading-progress:v1
 *   frontierllm:ui-prefs:v1
 *   frontierllm:recent-pages:v1
 */

import { z } from "zod/v4";

export type StorageKey =
  | "frontierllm:theme:v1"
  | "frontierllm:reading-progress:v1"
  | "frontierllm:ui-prefs:v1"
  | "frontierllm:recent-pages:v1";

export interface StorageEntry<T> {
  schema: z.ZodType<T>;
  defaultValue: T;
}

/**
 * Read a value from localStorage, validate with the provided Zod schema,
 * and return it. On any error (missing, corrupt, schema mismatch), logs a
 * warning and resets the key to the default value.
 */
export function storageGet<T>(
  key: StorageKey,
  entry: StorageEntry<T>
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return entry.defaultValue;

    const parsed = JSON.parse(raw) as unknown;
    const result = entry.schema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    console.warn(
      `[storage] Schema validation failed for key "${key}". Resetting to default.`,
      result.error.issues
    );
    storageSet(key, entry.defaultValue);
    return entry.defaultValue;
  } catch (err) {
    console.warn(`[storage] Failed to read key "${key}". Resetting to default.`, err);
    try {
      storageSet(key, entry.defaultValue);
    } catch {
      // localStorage may be unavailable (private browsing, quota)
    }
    return entry.defaultValue;
  }
}

/**
 * Write a value to localStorage, serialized as JSON.
 * Silently no-ops if localStorage is unavailable.
 */
export function storageSet<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Failed to write key "${key}".`, err);
  }
}

/**
 * Remove a key from localStorage.
 */
export function storageRemove(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── Schemas for each key ────────────────────────────────────────────────────

export const ThemeSchema = z.enum(["dark", "light", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const THEME_ENTRY: StorageEntry<Theme> = {
  schema: ThemeSchema,
  defaultValue: "dark",
};

export const ReadingProgressItemSchema = z.object({
  status: z.enum(["read", "unread"]),
  checkedAt: z.string().optional(),
});
export type ReadingProgressItem = z.infer<typeof ReadingProgressItemSchema>;

export const ReadingProgressSchema = z.record(z.string(), ReadingProgressItemSchema);
export type ReadingProgress = z.infer<typeof ReadingProgressSchema>;

export const READING_PROGRESS_ENTRY: StorageEntry<ReadingProgress> = {
  schema: ReadingProgressSchema,
  defaultValue: {},
};

export const UiPrefsSchema = z.object({
  readingFilter: z.enum(["all", "unread", "read"]).default("all"),
  notesView: z.enum(["grid", "list"]).default("grid"),
  sidebarCollapsed: z.boolean().default(false),
});
export type UiPrefs = z.infer<typeof UiPrefsSchema>;

export const UI_PREFS_ENTRY: StorageEntry<UiPrefs> = {
  schema: UiPrefsSchema,
  defaultValue: { readingFilter: "all", notesView: "grid", sidebarCollapsed: false },
};

export const RecentPagesSchema = z.array(z.string()).max(8);
export type RecentPages = z.infer<typeof RecentPagesSchema>;

export const RECENT_PAGES_ENTRY: StorageEntry<RecentPages> = {
  schema: RecentPagesSchema,
  defaultValue: [],
};
