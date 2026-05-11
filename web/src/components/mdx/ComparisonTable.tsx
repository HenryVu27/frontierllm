import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ComparisonTableProps {
  columns: string[];
  rows: ReactNode[][];
  caption?: string;
}

export function ComparisonTable({
  columns,
  rows,
  caption,
}: ComparisonTableProps) {
  return (
    <figure className="my-8 not-prose">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-subtle/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={cn(
                    "text-left px-3 py-2",
                    "text-xs font-semibold uppercase tracking-wider",
                    "text-muted-foreground",
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={cn(
                  "border-t border-border",
                  ri % 2 === 0 ? "" : "bg-subtle/20",
                )}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 align-top text-foreground/90 leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
