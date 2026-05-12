/**
 * ProjectStatusCard — used on dashboard + projects index.
 * Shows: project number + title, one-line goal, status pill, lineage arrows.
 */

import { useNavigate } from "react-router-dom";
import type { ManifestEntry } from "@/lib/manifest";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft } from "lucide-react";

// Project lineage metadata
const PROJECT_META: Record<string, {
  goal: string;
  inputs: string[];
  outputs: string[];
}> = {
  "01-pretrain-end-to-end": {
    goal: "Train a small GPT-class model from scratch on real data with proper tokenization, data pipelines, and distributed training.",
    inputs: [],
    outputs: ["Project 02", "Project 03"],
  },
  "02-post-train-end-to-end": {
    goal: "Fine-tune the base model from Project 01 with instruction tuning and RLHF to produce a chat-capable model.",
    inputs: ["Project 01"],
    outputs: ["Project 03"],
  },
  "03-eval-and-interp": {
    goal: "Evaluate and interpret both models from Projects 01–02 using standard benchmarks and mechanistic interpretability tools.",
    inputs: ["Projects 01–02"],
    outputs: [],
  },
};

interface Props {
  project: ManifestEntry;
}

export function ProjectStatusCard({ project }: Props) {
  const navigate = useNavigate();
  const meta = PROJECT_META[project.slug];
  const goal = meta?.goal ?? "";
  const inputs = meta?.inputs ?? [];
  const outputs = meta?.outputs ?? [];

  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${project.slug}`)}
      className={cn(
        "w-full text-left p-5",
        "border border-border rounded-lg",
        "flex flex-col gap-3",
        "transition-colors duration-150",
        "hover:bg-accent hover:shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "active:scale-[0.99]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            Project
          </p>
          <h3 className="text-base font-semibold tracking-tight text-foreground leading-snug">
            {project.title}
          </h3>
        </div>
        {/* Status pill */}
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full font-sans text-xs font-medium border bg-muted text-muted-foreground border-border">
          Scoped
        </span>
      </div>

      {/* Goal */}
      {goal && (
        <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {goal}
        </p>
      )}

      {/* Lineage arrows */}
      <div className="flex flex-col gap-1 pt-1 border-t border-border">
        {inputs.map((src) => (
          <div key={src} className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <ArrowLeft className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>inputs from {src}</span>
          </div>
        ))}
        {outputs.map((dst) => (
          <div key={dst} className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>outputs to {dst}</span>
          </div>
        ))}
        {inputs.length === 0 && outputs.length === 0 && (
          <span className="font-sans text-xs text-muted-foreground">No dependencies</span>
        )}
      </div>
    </button>
  );
}
