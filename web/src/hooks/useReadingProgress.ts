/**
 * useReadingProgress — reads/writes frontierllm:reading-progress:v1.
 *
 * Uses useSyncExternalStore so every component subscribed to this key
 * re-renders together when localStorage changes (including cross-tab).
 *
 * Schema: Record<itemId, { status: "read" | "unread", checkedAt?: ISO }>
 * Version: v1  — migration path is a no-op for now (YAGNI).
 *
 * Returns:
 *   progress      — the full map
 *   toggleItem(id)       — flip read ↔ unread
 *   setItem(id, status)  — set explicit status
 *   clearTopic(slug, manifest) — reset all items belonging to a topic
 *   clearAll()           — wipe the entire store
 *   importProgress(json) — replace store with JSON string
 *   exportProgress()     — serialise store to JSON string
 */

import { useSyncExternalStore, useCallback } from "react";
import {
  type ReadingProgress,
  READING_PROGRESS_ENTRY,
  storageGet,
  storageSet,
} from "@/lib/storage";
import type { Manifest } from "@/lib/manifest";

const STORAGE_KEY = "frontierllm:reading-progress:v1" as const;

// ─── External store helpers ───────────────────────────────────────────────────

/** In-memory snapshot — refreshed on every write and on storage events. */
let _snapshot: ReadingProgress = storageGet(STORAGE_KEY, READING_PROGRESS_ENTRY);

/** Registered listener callbacks from useSyncExternalStore. */
const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach((l) => l());
}

function _read(): ReadingProgress {
  return _snapshot;
}

function _subscribe(listener: () => void) {
  _listeners.add(listener);

  // Also handle cross-tab changes via the storage event
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      _snapshot = storageGet(STORAGE_KEY, READING_PROGRESS_ENTRY);
      _notify();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    _listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function _write(next: ReadingProgress) {
  _snapshot = next;
  storageSet(STORAGE_KEY, next);
  _notify();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseReadingProgressReturn {
  /** Full flat map of item progress */
  progress: ReadingProgress;
  /** Toggle a single item's read/unread state */
  toggleItem: (id: string) => void;
  /** Explicitly set a single item's status */
  setItem: (id: string, status: "read" | "unread") => void;
  /** Clear all items belonging to a topic (by slug, using the manifest) */
  clearTopic: (slug: string, manifest: Manifest) => void;
  /** Wipe all progress */
  clearAll: () => void;
  /** Replace progress with parsed JSON string; returns true on success */
  importProgress: (json: string) => boolean;
  /** Serialise current progress to a JSON string */
  exportProgress: () => string;
}

export function useReadingProgress(): UseReadingProgressReturn {
  const progress = useSyncExternalStore(_subscribe, _read, _read);

  const toggleItem = useCallback((id: string) => {
    const current = _snapshot[id];
    const next: ReadingProgress = {
      ..._snapshot,
      [id]: {
        status: current?.status === "read" ? "unread" : "read",
        checkedAt: new Date().toISOString(),
      },
    };
    _write(next);
  }, []);

  const setItem = useCallback((id: string, status: "read" | "unread") => {
    const next: ReadingProgress = {
      ..._snapshot,
      [id]: { status, checkedAt: new Date().toISOString() },
    };
    _write(next);
  }, []);

  const clearTopic = useCallback((slug: string, manifest: Manifest) => {
    const entry = manifest.entries.find((e) => e.slug === slug);
    if (!entry) return;
    const ids = new Set(entry.readingList.map((item) => item.id));
    const next: ReadingProgress = {};
    for (const [k, v] of Object.entries(_snapshot)) {
      if (!ids.has(k)) next[k] = v;
    }
    _write(next);
  }, []);

  const clearAll = useCallback(() => {
    _write({});
  }, []);

  const importProgress = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as unknown;
      const result = READING_PROGRESS_ENTRY.schema.safeParse(parsed);
      if (!result.success) {
        console.warn("[useReadingProgress] Import failed schema validation:", result.error.issues);
        return false;
      }
      _write(result.data);
      return true;
    } catch (err) {
      console.warn("[useReadingProgress] Import JSON parse error:", err);
      return false;
    }
  }, []);

  const exportProgress = useCallback((): string => {
    return JSON.stringify(_snapshot, null, 2);
  }, []);

  return {
    progress,
    toggleItem,
    setItem,
    clearTopic,
    clearAll,
    importProgress,
    exportProgress,
  };
}
