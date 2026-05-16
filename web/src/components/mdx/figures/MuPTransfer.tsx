import { useMemo, useState } from "react";

/**
 * MuPTransfer — the canonical µP "loss vs LR for several widths" plot.
 *
 * Under standard parameterization, the loss-vs-LR curves for different model
 * widths peak at *different* learning rates — so an LR tuned at small width
 * is wrong at large width, and you have to retune. Under maximal-update
 * parameterization (µP), the curves collapse: the optimal LR is the *same*
 * across widths, so you can tune cheaply at small width and transfer.
 *
 * Toggle between SP (standard) and µP modes. Each curve is a width;
 * x-axis is log LR, y-axis is illustrative final loss. The shared optimum
 * (vertical line) under µP is the key visual.
 */
type Mode = "sp" | "mup";

const WIDTHS = [128, 512, 2048, 8192];

export default function MuPTransfer() {
  const [mode, setMode] = useState<Mode>("mup");

  const W = 540;
  const H = 280;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 38;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Log10 LR range
  const xMin = -4, xMax = 0; // 1e-4 to 1e0
  // Loss range (illustrative — qualitative shape, not real loss numbers)
  const yMin = 1.8, yMax = 4.0;

  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  // Loss model:
  //   SP: optimum log LR shifts with width: argmin_lr ∝ −log(width)
  //   µP: optimum log LR is fixed for all widths (the whole point)
  //   Each curve is parabolic-ish around its optimum, with deeper bowl for larger width
  const N = 200;
  const widthCurves = useMemo(() => {
    return WIDTHS.map((w, i) => {
      const logW = Math.log2(w);
      // µP optimum at logLR = −2 (lr ≈ 0.01) for everybody
      // SP optimum drifts: smaller width → larger optimal LR
      const optX = mode === "mup" ? -2.0 : -1.0 - (logW - Math.log2(128)) * 0.35;
      // Loss floor scales with width (larger model → lower loss)
      const floor = 2.4 - 0.18 * (logW - Math.log2(128));
      // Bowl width depends on width too (larger model → narrower)
      const bowl = 0.6 - 0.05 * (logW - Math.log2(128));

      const pts: { x: number; y: number }[] = [];
      for (let s = 0; s < N; s++) {
        const x = xMin + (s / (N - 1)) * (xMax - xMin);
        const y = floor + Math.pow((x - optX) / bowl, 2);
        pts.push({ x, y: Math.min(yMax, y) });
      }
      // Find argmin
      let amin = pts[0]!;
      for (const p of pts) if (p.y < amin.y) amin = p;

      return { w, idx: i, pts, argmin: amin };
    });
  }, [mode]);

  const colors = [
    "color-mix(in oklch, var(--color-foreground) 35%, transparent)",
    "color-mix(in oklch, var(--color-foreground) 60%, transparent)",
    "var(--color-warning)",
    "var(--color-primary)",
  ];

  const pathOf = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("sp")}
          className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (mode === "sp" ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
          aria-pressed={mode === "sp"}
        >
          Standard parameterization
        </button>
        <button
          type="button"
          onClick={() => setMode("mup")}
          className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (mode === "mup" ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
          aria-pressed={mode === "mup"}
        >
          µP (maximal update)
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="µP transfer curves: loss vs learning rate for several widths" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* x ticks */}
        {[-4, -3, -2, -1, 0].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={H - padB - 3} x2={sx(t)} y2={H - padB + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>10^{t}</text>
          </g>
        ))}
        <text x={W - padR} y={H - padB + 28} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.6 }}>learning rate</text>
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>loss</text>

        {/* curves */}
        {widthCurves.map((c) => (
          <g key={c.w}>
            <path d={pathOf(c.pts)} fill="none" stroke={colors[c.idx]!} strokeWidth="2" />
            <circle cx={sx(c.argmin.x)} cy={sy(c.argmin.y)} r={3.5} fill={colors[c.idx]!} stroke="var(--color-background)" strokeWidth="1.2" />
          </g>
        ))}

        {/* shared optimum line in µP mode */}
        {mode === "mup" && (
          <>
            <line x1={sx(-2)} y1={padT} x2={sx(-2)} y2={H - padB} stroke="var(--color-warning)" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={sx(-2) + 4} y={padT + 10} className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-warning)" }}>
              shared optimum
            </text>
          </>
        )}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
        {WIDTHS.map((w, i) => (
          <span key={w} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: colors[i]! }} />
            width = {w}
          </span>
        ))}
      </div>
    </div>
  );
}
