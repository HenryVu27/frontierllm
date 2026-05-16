import { useMemo, useState } from "react";

/**
 * PipelineSchedule — the canonical pipeline-parallel timing diagram.
 *
 * Toggle between three schedules:
 *   • GPipe (naive)    — F forward microbatches, then B backward; large bubble
 *   • 1F1B             — interleave one-forward-one-backward; bubble = (P−1)/M
 *   • Zero-bubble (ZB) — split the activation backward and weight backward;
 *                         schedules the W-pass into the would-be bubble
 *
 * Each cell on the Gantt chart represents one microbatch · one direction on
 * one PP stage. Pixel time × stage → square; color encodes F vs B vs W vs idle.
 *
 * Microbatch count M and pipeline depth P are sliders.
 */
type Schedule = "gpipe" | "1f1b" | "zb";

export default function PipelineSchedule() {
  const [schedule, setSchedule] = useState<Schedule>("1f1b");
  const [M, setM] = useState(8);
  const [P, setP] = useState(4);

  const cellW = 22;
  const cellH = 22;
  const padL = 60;
  const padT = 34;
  const padR = 16;
  const padB = 32;

  // Build a P × T grid where each entry is "F:i" | "B:i" | "W:i" | null
  const grid = useMemo(() => buildSchedule(schedule, P, M), [schedule, P, M]);
  const T = grid[0]?.length ?? 0;

  const W = padL + T * cellW + padR;
  const H = padT + P * cellH + padB;

  // Bubble fraction
  const bubble = useMemo(() => bubbleFraction(grid), [grid]);

  return (
    <div className="w-full max-w-[680px] flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(["gpipe", "1f1b", "zb"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSchedule(s)}
            className={
              "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " +
              (schedule === s
                ? "border-foreground/40 bg-subtle/60 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")
            }
            aria-pressed={schedule === s}
          >
            {s === "gpipe" ? "GPipe (naive)" : s === "1f1b" ? "1F1B" : "Zero-bubble"}
          </button>
        ))}
        <div className="ml-auto text-[10.5px] font-mono text-muted-foreground tabular-nums">
          bubble = <span className="text-foreground">{(bubble * 100).toFixed(1)}%</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Pipeline parallel schedule: ${schedule}`} className="text-foreground">
        {/* row labels */}
        {Array.from({ length: P }).map((_, p) => (
          <text key={p} x={padL - 8} y={padT + p * cellH + cellH / 2 + 3} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>
            stage {p}
          </text>
        ))}
        {/* time axis */}
        <line x1={padL} y1={padT - 6} x2={padL + T * cellW} y2={padT - 6} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
        <text x={padL + T * cellW} y={padT - 12} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.6 }}>time →</text>

        {/* cells */}
        {grid.flatMap((row, p) =>
          row.map((cell, t) => {
            const x = padL + t * cellW;
            const y = padT + p * cellH;
            return (
              <g key={`${p}-${t}`}>
                <rect x={x + 1} y={y + 1} width={cellW - 2} height={cellH - 2} rx={2} fill={cellFill(cell)} stroke="currentColor" strokeOpacity={cell ? 0.45 : 0.12} strokeWidth="1" />
                {cell && (
                  <text x={x + cellW / 2} y={y + cellH / 2 + 3} textAnchor="middle" className="fill-current font-mono text-[8.5px] font-semibold">
                    {cell[0]}
                    <tspan style={{ opacity: 0.7 }}>{cell.slice(2)}</tspan>
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <LegendSwatch label="F · forward" color="color-mix(in oklch, var(--color-primary) 22%, transparent)" />
        <LegendSwatch label="B · activation backward" color="color-mix(in oklch, var(--color-warning) 26%, transparent)" />
        <LegendSwatch label="W · weight backward" color="color-mix(in oklch, var(--color-success) 24%, transparent)" />
        <LegendSwatch label="idle (bubble)" color="transparent" outline />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-1 pt-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>microbatches M</span>
            <span className="tabular-nums text-foreground">{M}</span>
          </label>
          <input type="range" min={2} max={16} step={1} value={M} onChange={(e) => setM(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Microbatches" />
        </div>
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>pipeline depth P</span>
            <span className="tabular-nums text-foreground">{P}</span>
          </label>
          <input type="range" min={2} max={6} step={1} value={P} onChange={(e) => setP(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Pipeline depth" />
        </div>
      </div>
    </div>
  );
}

function LegendSwatch({ label, color, outline }: { label: string; color: string; outline?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-sm border" style={{ background: color, borderColor: outline ? "currentColor" : "transparent", opacity: outline ? 0.4 : 1 }} />
      {label}
    </span>
  );
}

function cellFill(cell: string | null) {
  if (!cell) return "color-mix(in oklch, var(--color-foreground) 3%, transparent)";
  const k = cell[0];
  if (k === "F") return "color-mix(in oklch, var(--color-primary) 22%, transparent)";
  if (k === "B") return "color-mix(in oklch, var(--color-warning) 26%, transparent)";
  if (k === "W") return "color-mix(in oklch, var(--color-success) 24%, transparent)";
  return "transparent";
}

function bubbleFraction(grid: (string | null)[][]): number {
  const P = grid.length;
  if (P === 0) return 0;
  const T = grid[0]?.length ?? 0;
  if (T === 0) return 0;
  let idle = 0;
  let active = 0;
  // Only count up to last non-null per row for "useful" span; we count from
  // first activity to last activity per stage to define bubble fraction.
  for (let p = 0; p < P; p++) {
    const row = grid[p]!;
    let start = -1;
    let end = -1;
    for (let t = 0; t < T; t++) {
      if (row[t]) {
        if (start < 0) start = t;
        end = t;
      }
    }
    if (start < 0) continue;
    for (let t = start; t <= end; t++) {
      if (row[t]) active++;
      else idle++;
    }
  }
  return active + idle === 0 ? 0 : idle / (active + idle);
}

/**
 * Returns a P × T grid of strings like "F0", "B0", "W0", or null (idle).
 * Stages are 0..P-1. Microbatches are 0..M-1.
 * Each operation occupies one time slot in the schedule.
 */
function buildSchedule(schedule: Schedule, P: number, M: number): (string | null)[][] {
  // Allocate generous time horizon
  const maxT = 3 * P + 2 * M + 8;
  const grid: (string | null)[][] = Array.from({ length: P }, () => Array.from({ length: maxT }, () => null));

  if (schedule === "gpipe") {
    // F sweep: stage p does Fm at time p+m
    for (let m = 0; m < M; m++) {
      for (let p = 0; p < P; p++) grid[p]![p + m] = `F${m}`;
    }
    // B sweep starts right after all F: last F finishes at time P-1+M-1+0 in stage P-1
    // Backward propagates in reverse: stage P-1-p does Bm at time (M+P-1) + p + m
    const tBStart = M + P - 1;
    for (let m = 0; m < M; m++) {
      for (let p = 0; p < P; p++) {
        const stage = P - 1 - p;
        grid[stage]![tBStart + p + m] = `B${m}`;
      }
    }
  } else if (schedule === "1f1b") {
    // Warmup: stage p issues F0..F_{P-1-p} in slots p..(P-1)
    // Steady: 1F-1B interleave per stage
    // Cooldown: drain remaining backwards
    const warmupCount = (p: number) => P - p; // # forwards before first backward at stage p
    // Time of first forward of microbatch m at stage p: max(p+m, ...). Use canonical 1F1B:
    // We'll simulate directly with per-stage queues.
    const nextF = Array.from({ length: P }, () => 0); // next forward microbatch
    const nextB = Array.from({ length: P }, () => 0); // next backward microbatch
    const waitingBack = Array.from({ length: P }, () => 0); // # backwards ready
    // Track forward-completed microbatches arriving at stage P-1 to enqueue B at P-1
    // and propagated backward arrivals at stage p<P-1.
    // For visualization, we step time and assign at most one op per stage per step.

    const isReadyF = (p: number, t: number) => {
      if (nextF[p]! >= M) return false;
      const m = nextF[p]!;
      if (p === 0) return true;
      // need stage p-1 to have already completed F_m at some earlier time
      // (we'll check by looking at the grid)
      for (let tt = 0; tt < t; tt++) if (grid[p - 1]![tt] === `F${m}`) return true;
      return false;
    };
    const isReadyB = (p: number, t: number) => {
      if (nextB[p]! >= M) return false;
      const m = nextB[p]!;
      if (p === P - 1) {
        // B starts after F_m completes on this stage
        for (let tt = 0; tt < t; tt++) if (grid[p]![tt] === `F${m}`) return true;
        return false;
      }
      // need stage p+1 to have already completed B_m
      for (let tt = 0; tt < t; tt++) if (grid[p + 1]![tt] === `B${m}`) return true;
      return false;
    };

    for (let t = 0; t < maxT; t++) {
      for (let p = 0; p < P; p++) {
        // 1F1B policy: in steady-state prefer B if there are >= warmupCount in flight forwards on this stage
        const inFlight = nextF[p]! - nextB[p]!;
        const preferB = inFlight >= warmupCount(p);

        if (preferB && isReadyB(p, t)) {
          grid[p]![t] = `B${nextB[p]!}`;
          nextB[p]!++;
          continue;
        }
        if (isReadyF(p, t)) {
          grid[p]![t] = `F${nextF[p]!}`;
          nextF[p]!++;
          continue;
        }
        if (isReadyB(p, t)) {
          grid[p]![t] = `B${nextB[p]!}`;
          nextB[p]!++;
          continue;
        }
      }
    }
    // Suppress unused warning
    void waitingBack;
  } else {
    // zero-bubble: schedule F, then split B into B (activation grad) + W (weight grad)
    // After 1F1B steady, weight-grad W is scheduled into the bubble.
    // Approximation: build a 1F1B schedule, then convert each "B" into "B"
    // and append a separate "W" at a later free slot on the same stage.

    // First build a 1F1B grid.
    const oneFOne = buildSchedule("1f1b", P, M);
    for (let p = 0; p < P; p++) {
      for (let t = 0; t < maxT; t++) {
        grid[p]![t] = oneFOne[p]![t] ?? null;
      }
    }
    // Now for every B_m at stage p, insert a W_m at the earliest free slot
    // at the same stage *after* the B occurs. This fills bubbles.
    for (let p = 0; p < P; p++) {
      for (let t = 0; t < maxT; t++) {
        const c = grid[p]![t];
        if (c && c[0] === "B") {
          const m = c.slice(1);
          // find first free slot at or after t+1
          for (let tt = t + 1; tt < maxT; tt++) {
            if (!grid[p]![tt]) {
              grid[p]![tt] = `W${m}`;
              break;
            }
          }
        }
      }
    }
  }

  // Trim trailing empty columns
  let lastUsed = 0;
  for (let t = 0; t < maxT; t++) {
    for (let p = 0; p < P; p++) {
      if (grid[p]![t]) lastUsed = Math.max(lastUsed, t);
    }
  }
  return grid.map((row) => row.slice(0, lastUsed + 2));
}
