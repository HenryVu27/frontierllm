import { useState } from "react";

/**
 * DataMixStack — stacked data-mix curriculum across training stages.
 *
 * Three stages (canonical Llama-3-style curriculum):
 *   Stage 1 (early)   — broad web, moderate code
 *   Stage 2 (mid)     — shift toward higher-quality web + more code
 *   Stage 3 (annealing) — heavy quality + math + synthetic
 *
 * Each row = a training stage; each colored segment = a data source with
 * width ∝ fraction of tokens at that stage. The hover/click reveals the
 * exact percentages and absolute token counts.
 */
type Source = "web" | "highq" | "code" | "math" | "books" | "synth";

const SOURCES: { key: Source; label: string; color: string }[] = [
  { key: "web", label: "Common Crawl web", color: "color-mix(in oklch, var(--color-foreground) 35%, transparent)" },
  { key: "highq", label: "Curated high-quality web", color: "var(--color-primary)" },
  { key: "code", label: "Code (GitHub, StackEx.)", color: "var(--color-warning)" },
  { key: "math", label: "Math (papers, proofs)", color: "var(--color-success)" },
  { key: "books", label: "Books / Wikipedia", color: "color-mix(in oklch, var(--color-foreground) 60%, transparent)" },
  { key: "synth", label: "Synthetic", color: "color-mix(in oklch, var(--color-accent) 60%, transparent)" },
];

const STAGES: { name: string; tokens: string; sub: string; mix: Record<Source, number> }[] = [
  {
    name: "Stage 1 · broad",
    tokens: "~10T",
    sub: "first 60–70% of pretraining",
    mix: { web: 0.62, highq: 0.10, code: 0.15, math: 0.03, books: 0.06, synth: 0.04 },
  },
  {
    name: "Stage 2 · quality tilt",
    tokens: "~4T",
    sub: "middle 20–30%",
    mix: { web: 0.40, highq: 0.22, code: 0.18, math: 0.07, books: 0.07, synth: 0.06 },
  },
  {
    name: "Stage 3 · annealing",
    tokens: "~1T",
    sub: "final 5–10%, low LR",
    mix: { web: 0.10, highq: 0.30, code: 0.18, math: 0.18, books: 0.10, synth: 0.14 },
  },
];

export default function DataMixStack() {
  const [hovered, setHovered] = useState<{ stage: number; source: Source } | null>(null);

  const W = 580;
  const rowH = 50;
  const padL = 140;
  const padR = 20;
  const padT = 30;
  const H = padT + STAGES.length * (rowH + 18) + 20;

  const innerW = W - padL - padR;

  return (
    <div className="w-full max-w-[600px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Data mix across pretraining stages" className="text-foreground">
        <text x={padL} y={20} className="fill-current font-mono text-[10px] uppercase tracking-wider" style={{ opacity: 0.6 }}>
          token-fraction per data source
        </text>

        {STAGES.map((s, si) => {
          const yTop = padT + si * (rowH + 18);
          let xCursor = padL;
          return (
            <g key={s.name}>
              {/* stage label */}
              <text x={padL - 10} y={yTop + rowH / 2 + 4} textAnchor="end" className="fill-current text-[11px] font-semibold">{s.name}</text>
              <text x={padL - 10} y={yTop + rowH / 2 + 18} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{s.tokens} · {s.sub}</text>

              {/* bar segments */}
              {SOURCES.map((src) => {
                const frac = s.mix[src.key]!;
                const segW = frac * innerW;
                const x = xCursor;
                xCursor += segW;
                const isHovered = hovered && hovered.stage === si && hovered.source === src.key;
                return (
                  <g key={src.key}
                     onMouseEnter={() => setHovered({ stage: si, source: src.key })}
                     onMouseLeave={() => setHovered(null)}
                     style={{ cursor: "default" }}>
                    <rect
                      x={x}
                      y={yTop}
                      width={Math.max(0, segW - 1)}
                      height={rowH}
                      fill={src.color}
                      stroke={isHovered ? "currentColor" : "transparent"}
                      strokeWidth="1.5"
                      strokeOpacity={isHovered ? 0.8 : 0}
                    />
                    {segW > 30 && (
                      <text
                        x={x + segW / 2}
                        y={yTop + rowH / 2 + 4}
                        textAnchor="middle"
                        className="fill-current font-mono text-[10px] font-semibold"
                        style={{ pointerEvents: "none" }}
                      >
                        {(frac * 100).toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-mono text-muted-foreground">
        {SOURCES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      {hovered && (
        <div className="rounded-md border border-border bg-card/40 p-2 text-[10.5px] font-mono">
          <span className="text-muted-foreground">{STAGES[hovered.stage]!.name}</span>
          {" · "}
          <span>{SOURCES.find((s) => s.key === hovered.source)!.label}</span>
          {" · "}
          <span className="text-foreground font-semibold tabular-nums">
            {(STAGES[hovered.stage]!.mix[hovered.source]! * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
