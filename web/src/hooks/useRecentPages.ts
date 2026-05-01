/**
 * useRecentPages — tracks the last 8 visited manifest pages.
 *
 * Persists to localStorage key `frontierllm:recent-pages:v1`.
 * Each entry: { slug, title, href }.
 * Deduped by slug; most-recent-first; capped at 8.
 *
 * Usage:
 *   1. Mount `<RecentPagesTracker />` (or call pushPage) on route change.
 *   2. Call `recentPages` in CommandMenu to render the "Recent pages" section.
 */

import { useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  type RecentPages,
  type RecentPageEntry,
  RECENT_PAGES_ENTRY,
  storageGet,
  storageSet,
} from "@/lib/storage";
import { getEntry, getAllEntries } from "@/lib/manifest";

const STORAGE_KEY = "frontierllm:recent-pages:v1" as const;
const MAX_ENTRIES = 8;

// ─── External store ───────────────────────────────────────────────────────────

let _snapshot: RecentPages = storageGet(STORAGE_KEY, RECENT_PAGES_ENTRY);
const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach((l) => l());
}

function _read(): RecentPages {
  return _snapshot;
}

function _subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

function _write(next: RecentPages) {
  _snapshot = next;
  storageSet(STORAGE_KEY, next);
  _notify();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Push a page entry to the front of the recent pages list.
 * Dedupes by slug; caps at MAX_ENTRIES.
 */
export function pushRecentPage(entry: RecentPageEntry): void {
  const current = _snapshot;
  // Remove existing entry for the same slug
  const filtered = current.filter((e) => e.slug !== entry.slug);
  // Prepend and cap
  const next = [entry, ...filtered].slice(0, MAX_ENTRIES);
  _write(next);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRecentPages(): RecentPages {
  return useSyncExternalStore(_subscribe, _read, _read);
}

/**
 * Route-change tracker — call this inside AppShell or RootLayout.
 * On each location change, if the route matches a manifest entry,
 * push it into the recent pages store.
 */
export function useRecentPagesTracker(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const [first, second, third] = segments;

    let slug: string | undefined;
    let href: string | undefined;

    if (!first) {
      // Dashboard — not a manifest entry; skip
      return;
    }

    if (first === "notes" && second) {
      if (second === "07-frontier-labs" && third === "orientation") {
        slug = "07-frontier-labs-orientation";
        href = pathname;
      } else {
        slug = second;
        href = `/notes/${second}`;
      }
    } else if (first === "projects" && second) {
      slug = second;
      href = `/projects/${second}`;
    } else {
      return; // Non-content routes (dashboard, reading, about, search) — skip
    }

    if (!slug) return;

    // Look up entry in manifest
    const entry = getEntry(slug);
    if (!entry) {
      // Try to find by slug in all entries
      const all = getAllEntries();
      const found = all.find((e) => e.slug === slug);
      if (!found) return;
      pushRecentPage({
        slug: found.slug,
        title: found.title,
        href: href ?? pathname,
      });
      return;
    }

    pushRecentPage({
      slug: entry.slug,
      title: entry.title,
      href: href ?? pathname,
    });
  }, [pathname]);
}
