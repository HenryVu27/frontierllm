/**
 * RoadmapStrip — compact horizontal list of all 7 topics.
 * Each row: slug pill + 1-line gloss + thin progress bar + "X/Y" count.
 * Click → navigate to topic.
 */

import { useNavigate } from "react-router-dom";
import { getTopics } from "@/lib/manifest";
import { topicReadCount } from "@/lib/progress";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getAllEntries } from "@/lib/manifest";
import { useMemo } from "react";

// Brief one-line glosses for each topic slug (derived from "What this is" first sentence)
const TOPIC_GLOSS: Record<string, string> = {
  "00-foundations": "Vocabulary and refreshers assumed by every other topic.",
  "01-pretraining": "Data, architecture, scaling laws, and the training run.",
  "02-post-training": "Instruction tuning, RLHF, and alignment techniques.",
  "03-rlhf-and-rl": "Reward modeling, PPO, GRPO, and RL for language.",
  "04-distributed-training": "Parallelism strategies, memory, and hardware.",
  "05-eval-and-benchmarks": "Benchmarks, evals, and measuring capabilities.",
  "06-alignment-and-interp": "Safety, interpretability, and alignment research.",
  "07-frontier-labs": "What the leading labs are shipping and how.",
};

export function RoadmapStrip() {
  const navigate = useNavigate();
  const { progress } = useReadingProgress();
  const topics = getTopics().filter((t) => t.kind === "topic");

  const manifest = useMemo(() => ({
    generatedAt: "",
    entries: getAllEntries(),
  }), []);

  return (
    <div className="space-y-1.5">
      {topics.map((topic) => {
        const { read, total } = topicReadCount(topic.slug, manifest, progress);
        const pct = total > 0 ? Math.round((read / total) * 100) : 0;
        const gloss = TOPIC_GLOSS[topic.slug] ?? "";

        return (
          <button
            key={topic.slug}
            type="button"
            onClick={() => navigate(`/notes/${topic.slug}`)}
            className={cn(
              "w-full text-left rounded-lg px-3 py-2.5",
              "border border-transparent",
              "transition-colors duration-150",
              "hover:bg-accent hover:border-border",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
              "active:scale-[0.99]"
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {/* Slug pill */}
                <span className="font-mono text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 shrink-0">
                  {topic.slug.split("-")[0]}
                </span>
                {/* Topic title */}
                <span className="font-sans text-sm text-foreground truncate">
                  {topic.title}
                </span>
              </div>
              {/* Count */}
              <span className="font-sans text-xs text-muted-foreground shrink-0">
                {total > 0 ? `${read}/${total}` : "—"}
              </span>
            </div>

            {/* Gloss */}
            {gloss && (
              <p className="font-sans text-xs text-muted-foreground leading-snug mb-1.5 pl-0">
                {gloss}
              </p>
            )}

            {/* Progress bar */}
            {total > 0 && (
              <Progress
                value={pct}
                className="h-1"
                aria-label={`${read} of ${total} read`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
