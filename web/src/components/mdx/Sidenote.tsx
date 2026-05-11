import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidenoteProps {
  children: ReactNode;
}

let counter = 0;

export function Sidenote({ children }: SidenoteProps) {
  // Stable per-mount id for ARIA wiring
  const id = useId();
  const [open, setOpen] = useState(false);
  // Increment a module-level counter so each sidenote shows a number.
  // Reset semantics are best-effort — pages remount on navigation in this SPA,
  // so this is acceptable for an MVP. If numbering becomes wrong, replace this
  // with a SidenoteProvider that resets per chapter.
  const [num] = useState(() => ++counter);

  return (
    <span className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "align-super text-[10px] font-medium tabular-nums",
          "text-primary hover:underline focus-visible:outline-2",
          "focus-visible:outline-ring focus-visible:outline-offset-1",
          "mx-0.5 cursor-pointer",
        )}
      >
        [{num}]
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className={cn(
            "block my-2 mx-0 rounded-md border-l-2 border-primary/60",
            "bg-subtle/50 px-3 py-2 text-xs text-muted-foreground",
            "leading-relaxed",
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
