import { cn } from "@/lib/utils";
import { Info, AlertTriangle, BookOpen, PencilLine } from "lucide-react";
import type { ReactNode } from "react";

export type CalloutVariant = "info" | "warning" | "note" | "exercise";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const VARIANT_META: Record<
  CalloutVariant,
  { defaultTitle: string; Icon: typeof Info; tint: string; border: string }
> = {
  info: {
    defaultTitle: "Note",
    Icon: Info,
    tint: "bg-sky-50/40 dark:bg-sky-950/20",
    border: "border-l-sky-500/70",
  },
  warning: {
    defaultTitle: "Caution",
    Icon: AlertTriangle,
    tint: "bg-amber-50/40 dark:bg-amber-950/20",
    border: "border-l-amber-500/70",
  },
  note: {
    defaultTitle: "Note",
    Icon: BookOpen,
    tint: "bg-subtle/40",
    border: "border-l-foreground/30",
  },
  exercise: {
    defaultTitle: "Exercise",
    Icon: PencilLine,
    tint: "bg-emerald-50/40 dark:bg-emerald-950/20",
    border: "border-l-emerald-500/70",
  },
};

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const meta = VARIANT_META[variant];
  const Icon = meta.Icon;
  return (
    <aside
      className={cn(
        "my-6 rounded-r-md border-l-4 pl-4 pr-4 py-3",
        meta.tint,
        meta.border,
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title ?? meta.defaultTitle}
        </span>
      </div>
      <div className="prose-callout text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
