/**
 * useUiPrefs — exposes the `frontierllm:ui-prefs:v1` localStorage key
 * as a React state hook. Syncs across a single browser tab only
 * (no cross-tab storage events — acceptable for a single-user local tool).
 *
 * Keys (spec §5):
 *   readingFilter: "all" | "unread" | "read"
 *   notesView: "grid" | "list"
 *   sidebarCollapsed: boolean
 */

import { useCallback, useState } from "react";
import {
  type UiPrefs,
  UI_PREFS_ENTRY,
  storageGet,
  storageSet,
} from "@/lib/storage";

export function useUiPrefs(): {
  prefs: UiPrefs;
  setPref: <K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) => void;
} {
  const [prefs, setPrefs] = useState<UiPrefs>(() =>
    storageGet("frontierllm:ui-prefs:v1", UI_PREFS_ENTRY)
  );

  const setPref = useCallback(
    <K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        storageSet("frontierllm:ui-prefs:v1", next);
        return next;
      });
    },
    []
  );

  return { prefs, setPref };
}
