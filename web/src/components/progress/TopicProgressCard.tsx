/**
 * TopicProgressCard — single card for notes index / dashboard.
 * Shows: topic title, slug pill, 2-line gloss, progress bar, "X/Y read",
 * synthesis status pill, last-modified date.
 */

import { useNavigate } from "react-router-dom";
import type { ManifestEntry } from "@/lib/manifest";
import { getAllEntries } from "@/lib/manifest";
import { topicReadCount } from "@/lib/progress";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { StatusPill } from "@/components/progress/StatusPill";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

// Short 2-line glosses for each topic
const TOPIC_GLOSS: Record<string, string> = {
  "00-foundations": "Vocabulary and refreshers assumed by every other topic. Skim if confident; come back when stuck.",
  "01-pretraining": "Data pipelines, architecture choices, scaling laws, and the mechanics of the pretraining run itself.",
  "02-post-training": "Instruction tuning, RLHF, DPO, and the techniques that turn a base model into an assistant.",
  "03-rlhf-and-rl": "Reward modeling, PPO, GRPO, REINFORCE, and applying RL to language model policy optimization.",
  "04-distributed-training": "Tensor, pipeline, and data parallelism; memory optimization; hardware topology and efficiency.",
  "05-eval-and-benchmarks": "Capability benchmarks, evaluation methodology, and how to interpret progress claims.",
  "06-alignment-and-interp": "Alignment research, interpretability tools, and understanding what's happening inside the model.",
  "07-frontier-labs": "What the leading labs are shipping, the technical reports, and what to watch for.",
};

interface Props {
  topic: ManifestEntry;
  /** Layout variant — controls padding / border on grid vs list */
  variant?: "grid" | "list";
}

export function TopicProgressCard({ topic, variant = "grid" }: Props) {
  const navigate = useNavigate();
  const { progress } = useReadingProgress();

  const manifest = useMemo(() => ({
    generatedAt: "",
    entries: getAllEntries(),
  }), []);

  const { read, total } = topicReadCount(topic.slug, manifest, progress);
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;
  const gloss = TOPIC_GLOSS[topic.slug] ?? "";

  const handleClick = () => navigate(`/notes/${topic.slug}`);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left",
        "border border-border rounded-lg",
        "transition-colors duration-150",
        "hover:bg-accent hover:shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "active:scale-[0.99]",
        variant === "grid" ? "p-5" : "px-4 py-3 flex items-center gap-6"
      )}
    >
      {/* Main content */}
      <div className={cn("flex flex-col gap-2", variant === "list" ? "flex-1 min-w-0" : "")}>
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Slug pill */}
            <span className="font-mono text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 shrink-0">
              {topic.slug.split("-")[0]}
            </span>
            <h3 className="font-serif text-base font-medium text-foreground leading-snug truncate">
              {topic.title}
            </h3>
          </div>
          {variant === "grid" && (
            <StatusPill status={topic.synthesisStatus} className="shrink-0" />
          )}
        </div>

        {/* Gloss */}
        {gloss && (
          <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {gloss}
          </p>
        )}

        {/* Progress row */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-muted-foreground">
              {total > 0 ? `${read} / ${total} read` : "No reading list"}
            </span>
            <span className="font-sans text-xs text-muted-foreground">
              {formatDate(topic.lastModified)}
            </span>
          </div>
          {total > 0 && (
            <Progress
              value={pct}
              className="h-1"
              aria-label={`${read} of ${total} items read`}
            />
          )}
        </div>
      </div>

      {/* List-variant right column */}
      {variant === "list" && (
        <div className="flex items-center gap-3 shrink-0">
          <StatusPill status={topic.synthesisStatus} />
          <span className="font-sans text-xs text-muted-foreground">
            {total > 0 ? `${read}/${total}` : "—"}
          </span>
        </div>
      )}
    </button>
  );
}
