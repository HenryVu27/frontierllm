import { useMemo, useState } from "react";

/**
 * LossSpikeRecovery — characteristic loss-spike pattern during pretraining.
 *
 * A long monotonically-decreasing curve (typical pretraining loss), punctuated
 * by an upward spike at some step. The slider controls "recovery strategy":
 *   • do-nothing — the spike persists, loss never returns to trend
 *   • rollback   — restart from a recent checkpoint with smaller LR; the
 *                   curve dips and re-converges to trend within ~5k steps
 *   • skip-batch — skip the problematic batch and resume; the spike is
 *                   shallower and recovers quickly
 *
 * Shaded band marks the historical 1σ loss range to make "above trend"
 * visually salient. A small annotation calls out the spike step.
 */
type Strategy = "donothing" | "rollback" | "skipbatch";

export default function LossSpikeRecovery() {
  const [strategy, setStrategy] = useState<Strategy>("rollback");

  const W = 580;
  const H = 270;
  const padL = 44;
  const padR = 16;
  const padT = 20;
  const padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Step range
  const stepMax = 100; // think "thousands of steps"
  const spikeStep = 60;

  const xMin = 0, xMax = stepMax;
  const yMin = 1.6, yMax = 4.5;

  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  // Trend: 4.0 * exp(-0.025 * step) + 1.7
  const trend = (s: number) => 4.0 * Math.exp(-0.025 * s) + 1.7;
  const band = (s: number) => 0.08 + 0.02 * Math.exp(-0.02 * s); // shrinking variance

  // Build curve per strategy
  const N = 200;
  const curve = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < N; i++) {
      const s = xMin + (i / (N - 1)) * (xMax - xMin);
      let y: number;
      if (s < spikeStep - 1) {
        y = trend(s);
      } else if (s < spikeStep + 2) {
        // sharp spike
        y = trend(s) + 2.0 * Math.exp(-Math.pow((s - spikeStep) / 0.6, 2));
      } else {
        // post-spike behavior depends on strategy
        const sinceSpike = s - spikeStep;
        if (strategy === "donothing") {
          // never returns to trend; floor is 0.6 above trend
          y = trend(s) + 0.6 + 0.3 * Math.exp(-0.04 * sinceSpike);
        } else if (strategy === "rollback") {
          // checkpoint restart: dip back to trend(s-4) and re-converge
          const rollbackTarget = trend(s - 4);
          y = rollbackTarget + 0.4 * Math.exp(-0.12 * sinceSpike);
        } else {
          // skipbatch: short hop above trend, quickly re-converges
          y = trend(s) + 0.5 * Math.exp(-0.18 * sinceSpike);
        }
      }
      pts.push({ x: s, y: Math.min(yMax, Math.max(yMin, y)) });
    }
    return pts;
  }, [strategy]);

  // Band path
  const bandPath = useMemo(() => {
    const upper: string[] = [];
    const lower: string[] = [];
    for (let i = 0; i < N; i++) {
      const s = xMin + (i / (N - 1)) * (xMax - xMin);
      const tr = trend(s);
      const b = band(s);
      upper.push(`${i === 0 ? "M" : "L"} ${sx(s).toFixed(1)} ${sy(tr + b).toFixed(1)}`);
      lower.unshift(`L ${sx(s).toFixed(1)} ${sy(tr - b).toFixed(1)}`);
    }
    return upper.join(" ") + " " + lower.join(" ") + " Z";
  }, []);

  const curvePath = curve.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");

  return (
    <div className="w-full max-w-[600px] flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(["donothing", "rollback", "skipbatch"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStrategy(s)}
            className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (strategy === s ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
            aria-pressed={strategy === s}
          >
            {s === "donothing" ? "do nothing" : s === "rollback" ? "rollback + lower LR" : "skip bad batch"}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Pretraining loss spike and recovery" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* x ticks */}
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={H - padB - 3} x2={sx(t)} y2={H - padB + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}k</text>
          </g>
        ))}
        <text x={W - padR} y={H - padB + 28} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.6 }}>training step</text>
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>loss</text>

        {/* trend band */}
        <path d={bandPath} fill="color-mix(in oklch, var(--color-foreground) 6%, transparent)" />

        {/* spike step marker */}
        <line x1={sx(spikeStep)} y1={padT} x2={sx(spikeStep)} y2={H - padB} stroke="var(--color-warning)" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={sx(spikeStep) + 4} y={padT + 12} className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-warning)" }}>spike @ step 60k</text>

        {/* main curve */}
        <path d={curvePath} fill="none" stroke="var(--color-primary)" strokeWidth="1.8" />
      </svg>

      <div className="text-[10px] font-mono text-muted-foreground px-1">
        Shaded band = ±1σ historical trend. The 'do nothing' tail above the band is the canonical 'lost run' signature.
      </div>
    </div>
  );
}
