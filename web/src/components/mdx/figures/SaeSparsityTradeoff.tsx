import { useMemo, useState } from "react";

/**
 * SaeSparsityTradeoff — the sparsity–reconstruction Pareto frontier for SAEs.
 *
 * Y-axis: reconstruction error (fraction of variance unexplained).
 * X-axis: L0 (average # active features per token).
 *
 * Move the slider on L0; the curve shifts. Two model families are drawn:
 *   • TopK / standard ReLU SAE — convex frontier
 *   • Gated / JumpReLU SAE     — strictly better Pareto frontier
 *
 * A horizontal "frozen LM degradation" line shows the threshold at which the
 * downstream LM loses too much capability when activations are replaced by
 * the SAE reconstruction (a common quality criterion).
 *
 * Numbers are illustrative; the qualitative shape matches Anthropic /
 * GDM / EleutherAI public sweeps.
 */
export default function SaeSparsityTradeoff() {
  const [l0, setL0] = useState(30);

  const W = 540;
  const H = 280;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 38;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xMin = 5, xMax = 200;
  const yMin = 0, yMax = 0.5;

  const sx = (x: number) =>
    padL + ((Math.log10(x) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  // Reconstruction loss as a function of L0, two curves
  // L_relu(L0) = 0.45 / (1 + 0.04 * L0) + 0.06
  // L_gated(L0) = 0.45 / (1 + 0.07 * L0) + 0.03
  const reluLoss = (x: number) => 0.45 / (1 + 0.04 * x) + 0.06;
  const gatedLoss = (x: number) => 0.45 / (1 + 0.07 * x) + 0.03;

  const N = 200;
  const { reluPath, gatedPath } = useMemo(() => {
    const r: string[] = [];
    const g: string[] = [];
    for (let i = 0; i < N; i++) {
      const lx = Math.log10(xMin) + (i / (N - 1)) * (Math.log10(xMax) - Math.log10(xMin));
      const x = Math.pow(10, lx);
      const yr = Math.min(yMax, reluLoss(x));
      const yg = Math.min(yMax, gatedLoss(x));
      r.push(`${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(yr).toFixed(1)}`);
      g.push(`${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(yg).toFixed(1)}`);
    }
    return { reluPath: r.join(" "), gatedPath: g.join(" ") };
  }, []);

  const QUALITY_THRESHOLD = 0.08;
  const cursorRelu = reluLoss(l0);
  const cursorGated = gatedLoss(l0);

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="SAE sparsity vs reconstruction tradeoff" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* x ticks (log scale) */}
        {[10, 30, 100].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={H - padB - 3} x2={sx(t)} y2={H - padB + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}</text>
          </g>
        ))}
        <text x={W - padR} y={H - padB + 28} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.6 }}>
          L0 (active features per token, log scale)
        </text>

        {/* y ticks */}
        {[0.1, 0.2, 0.3, 0.4].map((t) => (
          <g key={`y-${t}`}>
            <line x1={padL - 3} y1={sy(t)} x2={padL + 3} y2={sy(t)} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={padL - 6} y={sy(t) + 3} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t.toFixed(1)}</text>
          </g>
        ))}
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>FVU</text>

        {/* quality threshold */}
        <line x1={padL} y1={sy(QUALITY_THRESHOLD)} x2={W - padR} y2={sy(QUALITY_THRESHOLD)} stroke="var(--color-warning)" strokeOpacity="0.65" strokeWidth="1.2" strokeDasharray="4 4" />
        <text x={W - padR - 4} y={sy(QUALITY_THRESHOLD) - 4} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-warning)" }}>downstream-quality threshold</text>

        {/* curves */}
        <path d={reluPath} fill="none" stroke="color-mix(in oklch, var(--color-foreground) 55%, transparent)" strokeWidth="2" />
        <path d={gatedPath} fill="none" stroke="var(--color-primary)" strokeWidth="2" />

        {/* cursor */}
        <line x1={sx(l0)} y1={padT} x2={sx(l0)} y2={H - padB} stroke="var(--color-warning)" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx={sx(l0)} cy={sy(cursorRelu)} r={3.5} fill="color-mix(in oklch, var(--color-foreground) 55%, transparent)" />
        <circle cx={sx(l0)} cy={sy(cursorGated)} r={3.5} fill="var(--color-primary)" />
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4" style={{ background: "color-mix(in oklch, var(--color-foreground) 55%, transparent)" }} />
          ReLU SAE
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4" style={{ background: "var(--color-primary)" }} />
          Gated / JumpReLU
        </span>
      </div>

      <div className="rounded-md border border-border bg-card/40 p-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[10.5px] font-mono">
        <div className="text-muted-foreground">FVU (ReLU)</div>
        <div className="text-right tabular-nums">{(cursorRelu * 100).toFixed(1)}% {cursorRelu > QUALITY_THRESHOLD && <span style={{ color: "var(--color-warning)" }}>· over threshold</span>}</div>
        <div className="text-muted-foreground">FVU (Gated)</div>
        <div className="text-right tabular-nums">{(cursorGated * 100).toFixed(1)}% {cursorGated > QUALITY_THRESHOLD && <span style={{ color: "var(--color-warning)" }}>· over threshold</span>}</div>
      </div>

      <div className="px-1">
        <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
          <span>target L0 (active features)</span>
          <span className="tabular-nums text-foreground">{l0}</span>
        </label>
        <input type="range" min={5} max={200} step={1} value={l0} onChange={(e) => setL0(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Target L0" />
      </div>
    </div>
  );
}
