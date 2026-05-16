import { useMemo, useState } from "react";

/**
 * RecomputeMemory — activation memory vs recompute factor tradeoff.
 *
 * Y-axis: memory per training step (params + activations + opt state).
 * X-axis: fraction of activations recomputed (0 = save all, 1 = recompute all).
 *
 * Curve shows activations falling roughly linearly with the recompute factor.
 * A horizontal "device memory" line lets you see where you cross over.
 * Slider exposes batch size, since activations scale linearly with batch.
 *
 * The compute-cost overlay: extra FLOPs introduced by selective/full recompute,
 * expressed as a fraction of the original forward FLOPs.
 */
export default function RecomputeMemory() {
  const [batch, setBatch] = useState(8);
  const [recompute, setRecompute] = useState(0.0); // 0..1

  const W = 540;
  const H = 270;
  const padL = 48;
  const padR = 16;
  const padT = 18;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Memory model (illustrative, in GB):
  //   params + opt state: constant 40 GB (e.g., a 7B model with optimizer)
  //   activations:        coeff * batch * (1 - recompute)
  const PARAMS_OPT = 40;
  const ACT_PER_BATCH = 12; // GB per unit batch when nothing is recomputed

  const yMax = PARAMS_OPT + ACT_PER_BATCH * 16; // for a worst-case batch=16
  const yMin = 0;
  const xMax = 1;
  const xMin = 0;

  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const memAt = (r: number) => PARAMS_OPT + ACT_PER_BATCH * batch * (1 - r);
  const flopsAt = (r: number) => 1 + r * (1 / 3); // full-recompute = +33% bwd FLOPs ≈ industry rule-of-thumb

  const curve = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 50; i++) {
      const r = i / 50;
      pts.push({ x: r, y: memAt(r) });
    }
    return pts;
  }, [batch]);

  const path = curve.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");

  const DEVICE_MEM = 80; // GB, e.g., A100/H100 80GB

  const cursorMem = memAt(recompute);
  const cursorFlops = flopsAt(recompute);

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Activation memory vs recompute factor tradeoff" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* x ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={H - padB - 3} x2={sx(t)} y2={H - padB + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t.toFixed(2)}</text>
          </g>
        ))}
        <text x={W - padR} y={H - padB + 28} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.6 }}>recompute fraction r</text>

        {/* y ticks */}
        {[0, 40, 80, 120, 160, 200].map((t) => (
          <g key={`y-${t}`}>
            <line x1={padL - 3} y1={sy(t)} x2={padL + 3} y2={sy(t)} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={padL - 6} y={sy(t) + 3} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}</text>
          </g>
        ))}
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>GB</text>

        {/* device-memory line */}
        <line x1={padL} y1={sy(DEVICE_MEM)} x2={W - padR} y2={sy(DEVICE_MEM)} stroke="var(--color-warning)" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="4 4" />
        <text x={W - padR - 4} y={sy(DEVICE_MEM) - 4} textAnchor="end" className="fill-current font-mono text-[9px] font-semibold" style={{ fill: "var(--color-warning)" }}>device cap (80 GB)</text>

        {/* memory curve */}
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2" />

        {/* shaded area for activations (above params/opt baseline) */}
        <path
          d={
            `M ${sx(0)} ${sy(PARAMS_OPT)} ` +
            curve.map((p) => `L ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ") +
            ` L ${sx(1)} ${sy(PARAMS_OPT)} Z`
          }
          fill="color-mix(in oklch, var(--color-primary) 10%, transparent)"
        />
        {/* baseline */}
        <line x1={padL} y1={sy(PARAMS_OPT)} x2={W - padR} y2={sy(PARAMS_OPT)} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 4" />
        <text x={W - padR - 4} y={sy(PARAMS_OPT) + 11} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>params + opt state</text>

        {/* cursor */}
        <line x1={sx(recompute)} y1={padT} x2={sx(recompute)} y2={H - padB} stroke="var(--color-warning)" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx={sx(recompute)} cy={sy(cursorMem)} r={4} fill="var(--color-warning)" />
      </svg>

      <div className="rounded-md border border-border bg-card/40 p-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[10.5px] font-mono">
        <div className="text-muted-foreground">memory at cursor</div>
        <div className="text-foreground text-right tabular-nums">{cursorMem.toFixed(1)} GB {cursorMem > DEVICE_MEM && <span style={{ color: "var(--color-warning)" }}>(OOM)</span>}</div>
        <div className="text-muted-foreground">bwd compute overhead</div>
        <div className="text-foreground text-right tabular-nums">+{((cursorFlops - 1) * 100).toFixed(1)}%</div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>recompute fraction</span>
            <span className="tabular-nums text-foreground">{recompute.toFixed(2)}</span>
          </label>
          <input type="range" min={0} max={1} step={0.01} value={recompute} onChange={(e) => setRecompute(parseFloat(e.target.value))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Recompute fraction" />
        </div>
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>per-device batch</span>
            <span className="tabular-nums text-foreground">{batch}</span>
          </label>
          <input type="range" min={1} max={16} step={1} value={batch} onChange={(e) => setBatch(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Batch size" />
        </div>
      </div>
    </div>
  );
}
