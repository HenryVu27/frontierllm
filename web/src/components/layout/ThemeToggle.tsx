/**
 * ThemeToggle — 3-state segmented control: sun / monitor / moon.
 * Uses lucide-react icons. Calls useTheme to switch modes.
 * Dropped into Topbar in Phase 4; standalone here for Phase 2 verification.
 */

import { Sun, Monitor, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/storage";

interface ThemeOption {
  value: Theme;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5 gap-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} mode`}
            title={`${label} mode`}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
