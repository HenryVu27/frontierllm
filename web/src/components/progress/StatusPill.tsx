/**
 * StatusPill — small reusable pill for synthesis / project status.
 * Variants: "empty" (muted), "started" (primary), "scoped" (info blue).
 */

import { cn } from "@/lib/utils";

type StatusVariant = "empty" | "started" | "scoped";

interface Props {
  status: StatusVariant;
  className?: string;
}

const CONFIG: Record<StatusVariant, { label: string; className: string }> = {
  empty: {
    label: "Empty",
    className: "bg-muted text-muted-foreground border-border",
  },
  started: {
    label: "Started",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  scoped: {
    label: "Scoped",
    className: "bg-info/10 text-info border-info/30",
  },
};

export function StatusPill({ status, className }: Props) {
  const cfg = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full",
        "font-sans text-xs font-medium border",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
