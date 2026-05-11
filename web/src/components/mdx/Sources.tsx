import { cn } from "@/lib/utils";

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
    <section className="my-8 not-prose">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Sources
      </h2>
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
    </section>
  );
}
