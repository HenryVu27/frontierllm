/**
 * Progress derivation utilities — pure functions, no React.
 * Consumed by Sidebar dots, DashboardPage, NotesIndexPage, TopicPage, etc.
 */

import type { Manifest, ManifestEntry } from "@/lib/manifest";
import type { ReadingProgress } from "@/lib/storage";

// ─── Per-topic ─────────────────────────────────────────────────────────────────

/**
 * Returns the fraction of reading-list items marked "read" for a topic,
 * as an integer 0–100. Returns null when the topic has no reading-list items
 * (per spec §6 — display "—" instead of 0%).
 */
export function topicCompletenessPct(
  slug: string,
  manifest: Manifest,
  progress: ReadingProgress
): number | null {
  const entry = manifest.entries.find((e) => e.slug === slug);
  if (!entry) return null;
  const total = entry.readingList.length;
  if (total === 0) return null;
  const read = entry.readingList.filter(
    (item) => progress[item.id]?.status === "read"
  ).length;
  return Math.round((read / total) * 100);
}

/**
 * Returns { read, total } for a topic's reading list.
 */
export function topicReadCount(
  slug: string,
  manifest: Manifest,
  progress: ReadingProgress
): { read: number; total: number } {
  const entry = manifest.entries.find((e) => e.slug === slug);
  if (!entry) return { read: 0, total: 0 };
  const total = entry.readingList.length;
  const read = entry.readingList.filter(
    (item) => progress[item.id]?.status === "read"
  ).length;
  return { read, total };
}

// ─── Overall ───────────────────────────────────────────────────────────────────

/**
 * Weighted average of topic completeness across all topics with reading lists.
 * Topics with total === 0 are excluded from the denominator (per spec §6).
 * Returns 0 when there are no items across all topics.
 */
export function overallCompletenessPct(
  manifest: Manifest,
  progress: ReadingProgress
): number {
  let totalItems = 0;
  let readItems = 0;

  for (const entry of manifest.entries) {
    const total = entry.readingList.length;
    if (total === 0) continue;
    const read = entry.readingList.filter(
      (item) => progress[item.id]?.status === "read"
    ).length;
    totalItems += total;
    readItems += read;
  }

  if (totalItems === 0) return 0;
  return Math.round((readItems / totalItems) * 100);
}

// ─── Dashboard helpers ─────────────────────────────────────────────────────────

/**
 * Count of manifest entries with synthesisStatus === "started".
 */
export function synthesisStartedCount(manifest: Manifest): number {
  return manifest.entries.filter((e) => e.synthesisStatus === "started").length;
}

/**
 * The n most recently modified manifest entries, sorted descending by lastModified.
 */
export function recentlyEdited(manifest: Manifest, n = 5): ManifestEntry[] {
  return [...manifest.entries]
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
    .slice(0, n);
}

/**
 * Total reading items across all entries (for dashboard "X of Y" display).
 */
export function totalReadingItems(manifest: Manifest): number {
  return manifest.entries.reduce((acc, e) => acc + e.readingList.length, 0);
}

/**
 * Total read items across all entries.
 */
export function totalReadItems(manifest: Manifest, progress: ReadingProgress): number {
  return manifest.entries.reduce(
    (acc, e) =>
      acc +
      e.readingList.filter((item) => progress[item.id]?.status === "read").length,
    0
  );
}
