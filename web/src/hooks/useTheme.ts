/**
 * useTheme — three-state theme hook.
 * Values: "dark" | "light" | "system" (default: "dark")
 * Persists to localStorage at key "frontierllm:theme:v1".
 * Applies class "dark" on <html> element.
 */

import { useCallback, useEffect, useState } from "react";
import { type Theme, THEME_ENTRY, storageGet, storageSet } from "@/lib/storage";

function getSystemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeClass(theme: Theme): void {
  const root = document.documentElement;
  const prefersDark = getSystemPrefersDark();
  const shouldBeDark = theme === "dark" || (theme === "system" && prefersDark);

  // Temporarily suppress transitions during theme switch (respects reduced-motion
  // via CSS, but this avoids flash for instant switching on toggle)
  root.classList.add("transition-none");
  if (shouldBeDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  // Re-enable transitions on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("transition-none");
    });
  });
}

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() =>
    storageGet("frontierllm:theme:v1", THEME_ENTRY)
  );

  // Apply the theme class on initial mount and on every change
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass("system");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    storageSet("frontierllm:theme:v1", newTheme);
    setThemeState(newTheme);
    applyThemeClass(newTheme);
  }, []);

  const resolvedTheme: "dark" | "light" =
    theme === "system"
      ? getSystemPrefersDark() ? "dark" : "light"
      : theme;

  return { theme, setTheme, resolvedTheme };
}

// Apply the initial theme immediately (before React hydrates) to avoid FOUC
// This runs at module load time.
(function initTheme() {
  try {
    const raw = localStorage.getItem("frontierllm:theme:v1");
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    const theme: Theme =
      parsed === "dark" || parsed === "light" || parsed === "system"
        ? (parsed as Theme)
        : "dark";
    applyThemeClass(theme);
  } catch {
    // Fail silently — default dark will be applied by the hook on mount
    document.documentElement.classList.add("dark");
  }
})();
