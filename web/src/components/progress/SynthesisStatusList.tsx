/**
 * SynthesisStatusList — lists all 7 note topics with synthesis status pills.
 * Used on the dashboard right card.
 */

import { Link } from "react-router-dom";
import { getTopics } from "@/lib/manifest";
import { StatusPill } from "@/components/progress/StatusPill";
import { cn } from "@/lib/utils";

export function SynthesisStatusList() {
  const topics = getTopics().filter((t) => t.kind === "topic");

  return (
    <ul className="space-y-1.5 mt-3">
      {topics.map((topic) => (
        <li key={topic.slug}>
          <Link
            to={`/notes/${topic.slug}`}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5",
              "transition-colors duration-150",
              "hover:bg-accent",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
            )}
          >
            <span className="font-sans text-xs text-foreground truncate">
              {topic.title}
            </span>
            <StatusPill status={topic.synthesisStatus} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
