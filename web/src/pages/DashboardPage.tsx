/**
 * DashboardPage — /
 * Phase 6: Full implementation.
 * - Hero: repo title + description.
 * - Active activity callout (orientation pass).
 * - Overall progress card (circular meter) + Synthesis status card.
 * - RoadmapStrip (7 topics).
 * - Project status grid (3 cards).
 * - Recently edited section.
 */

import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { CircularProgress } from "@/components/progress/CircularProgress";
import { SynthesisStatusList } from "@/components/progress/SynthesisStatusList";
import { RoadmapStrip } from "@/components/progress/RoadmapStrip";
import { ProjectStatusCard } from "@/components/progress/ProjectStatusCard";
import { RecentEdits } from "@/components/progress/RecentEdits";
import { Button } from "@/components/ui/button";
import {
  overallCompletenessPct,
  synthesisStartedCount,
  topicReadCount,
  totalReadingItems,
  totalReadItems,
} from "@/lib/progress";
import { getTopics, getProjects, getAllEntries } from "@/lib/manifest";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function DashboardPage() {
  const { progress } = useReadingProgress();

  const manifest = useMemo(() => ({
    generatedAt: "",
    entries: getAllEntries(),
  }), []);

  const overallPct = overallCompletenessPct(manifest, progress);
  const synthCount = synthesisStartedCount(manifest);
  const topics = getTopics().filter((t) => t.kind === "topic");
  const projects = getProjects();
  const totalItems = totalReadingItems(manifest);
  const readItems = totalReadItems(manifest, progress);

  // Orientation pass progress
  const orientationCount = topicReadCount("07-frontier-labs-orientation", manifest, progress);

  return (
    <PageContainer>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-2">
          frontierllm
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Personal frontier LLM training-side study — notes, reading lists, and projects.
        </p>
      </div>

      {/* ── Active activity callout ─────────────────────────────────────── */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          First active activity
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-foreground leading-snug mb-1">
          Orientation pass
        </h2>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-3">
          Read 6 recent frontier-model technical reports and produce a comparative writeup.
          {" "}
          <span className="text-foreground font-medium">
            {orientationCount.read}/{orientationCount.total} reports read.
          </span>
        </p>
        <Button asChild size="sm" className="font-sans text-sm">
          <Link to="/notes/07-frontier-labs/orientation">Open orientation</Link>
        </Button>
      </div>

      {/* ── Progress cards row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overall progress card */}
        <div className="border border-border rounded-lg p-5">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Overall progress
          </h2>
          <div className="flex items-center gap-5">
            <CircularProgress pct={overallPct} size={100} strokeWidth={7} />
            <div>
              <p className="text-base text-foreground leading-snug mb-1">
                {readItems} of {totalItems} reading items read
              </p>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                across {topics.length} topics
              </p>
            </div>
          </div>
        </div>

        {/* Synthesis status card */}
        <div className="border border-border rounded-lg p-5">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Synthesis status
          </h2>
          <p className="text-sm text-foreground">
            Started in{" "}
            <span className="font-medium">{synthCount}</span> of{" "}
            <span className="font-medium">{topics.length}</span> topics
          </p>
          <SynthesisStatusList />
        </div>
      </div>

      {/* ── Roadmap strip ────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Topic roadmap
        </h2>
        <RoadmapStrip />
      </section>

      {/* ── Project status grid ──────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectStatusCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* ── Recently edited ──────────────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Recently edited
        </h2>
        <RecentEdits count={5} />
      </section>
    </PageContainer>
  );
}
