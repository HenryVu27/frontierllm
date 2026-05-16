import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface SourceItem {
  authors: string;
  year: string | number;
  title: string;
  venue?: string;
  url?: string;
  note?: string;
}

interface SourcesProps {
  items: SourceItem[];
  caption?: string;
}

export function Sources({ items, caption }: SourcesProps) {
  return (
    <details className="group my-8 not-prose">
      <summary
        className={cn(
          "flex items-center gap-2 cursor-pointer select-none",
          "list-none [&::-webkit-details-marker]:hidden",
          "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
          "hover:text-foreground transition-colors",
        )}
      >
        <ChevronRight
          className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-open:rotate-90"
          aria-hidden
        />
        <span>Sources</span>
        <span className="text-muted-foreground/70 normal-case font-normal tracking-normal">
          ({items.length})
        </span>
      </summary>
      <div className="mt-3">
        {caption && (
          <p className="text-xs text-muted-foreground mb-4 italic">{caption}</p>
        )}
        <ol className="space-y-3 list-none pl-0">
          {items.map((item, i) => (
            <li
              key={`${item.authors}-${item.year}-${i}`}
              className={cn(
                "text-sm leading-relaxed text-foreground/90",
                "border-l-2 border-border pl-3",
              )}
            >
              <span className="font-medium">{item.authors}</span>
              <span className="text-muted-foreground"> ({item.year}). </span>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {item.title}
                </a>
              ) : (
                <span className="italic">{item.title}</span>
              )}
              {item.venue && (
                <span className="text-muted-foreground">. {item.venue}</span>
              )}
              {item.note && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  — {item.note}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
