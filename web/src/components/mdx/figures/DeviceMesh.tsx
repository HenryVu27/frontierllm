import { useMemo, useState } from "react";

/**
 * DeviceMesh — interactive 3D parallelism mesh (DP × TP × PP).
 *
 * Drag three sliders for (DP, TP, PP); the mesh updates live. Each
 * GPU is drawn as a small square positioned in an isometric grid:
 *  • x-axis: TP rank within a node (color-cycled)
 *  • y-axis: PP stage
 *  • z-axis (offset): DP replica
 *
 * Below the mesh, derived stats: total GPUs = DP · TP · PP and a
 * one-line comm-pattern summary for each axis.
 */
export default function DeviceMesh() {
  const [dp, setDp] = useState(2);
  const [tp, setTp] = useState(4);
  const [pp, setPp] = useState(3);

  const total = dp * tp * pp;

  // Layout
  const W = 580;
  const H = 320;

  // Per-cell size shrinks as mesh grows
  const baseCell = Math.max(14, Math.min(26, Math.floor(160 / Math.max(tp, pp))));
  const cell = baseCell;
  const gap = 3;

  // Origin for the front (dp=0) plane
  const planeW = tp * cell + (tp - 1) * gap;
  const planeH = pp * cell + (pp - 1) * gap;
  const planeX0 = 60;
  const planeY0 = (H - planeH) / 2 - 10;

  // Offset between DP replicas in the isometric depth direction
  const dpOffset = 18;

  const cells = useMemo(() => {
    const out: { x: number; y: number; tpIdx: number; ppIdx: number; dpIdx: number }[] = [];
    for (let d = dp - 1; d >= 0; d--) {
      for (let p = 0; p < pp; p++) {
        for (let t = 0; t < tp; t++) {
          const x = planeX0 + t * (cell + gap) + d * dpOffset;
          const y = planeY0 + p * (cell + gap) - d * (dpOffset * 0.6);
          out.push({ x, y, tpIdx: t, ppIdx: p, dpIdx: d });
        }
      }
    }
    return out;
  }, [dp, tp, pp, cell, gap, planeX0, planeY0]);

  // Color cycle for TP rank
  const tpFill = (i: number) => {
    const palette = [
      "color-mix(in oklch, var(--color-primary) 22%, transparent)",
      "color-mix(in oklch, var(--color-warning) 26%, transparent)",
      "color-mix(in oklch, var(--color-success) 24%, transparent)",
      "color-mix(in oklch, var(--color-accent) 50%, transparent)",
    ];
    return palette[i % palette.length];
  };

  return (
    <div className="w-full max-w-[600px] flex flex-col gap-4">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="3D device mesh with DP, TP, PP axes" className="text-foreground">
        {/* Axis labels */}
        <text x={planeX0 + planeW / 2} y={H - 12} textAnchor="middle" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>
          TP rank →  ({tp})
        </text>
        <text x={planeX0 - 14} y={planeY0 + planeH / 2} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }} transform={`rotate(-90 ${planeX0 - 14} ${planeY0 + planeH / 2})`}>
          PP stage ↓  ({pp})
        </text>
        <text x={planeX0 + planeW + dp * dpOffset + 24} y={planeY0 - dp * dpOffset * 0.6 + 14} className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>
          DP replicas ↗ ({dp})
        </text>

        {cells.map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={cell} height={cell} rx={2} fill={tpFill(c.tpIdx)} stroke="currentColor" strokeOpacity={c.dpIdx === 0 ? 0.6 : 0.3} strokeWidth="1" />
            {cell >= 18 && (
              <text x={c.x + cell / 2} y={c.y + cell / 2 + 3} textAnchor="middle" className="fill-current font-mono text-[8px]" style={{ opacity: 0.75 }}>
                {c.tpIdx}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-1">
        <Slider label="DP" value={dp} min={1} max={8} onChange={setDp} />
        <Slider label="TP" value={tp} min={1} max={8} onChange={setTp} />
        <Slider label="PP" value={pp} min={1} max={8} onChange={setPp} />
      </div>

      <div className="rounded-md border border-border bg-card/40 p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[10.5px] font-mono">
        <div className="text-muted-foreground">total GPUs</div>
        <div className="text-foreground text-right tabular-nums">{total}</div>
        <div className="text-muted-foreground">DP comm</div>
        <div className="text-right">all-reduce (gradients) / reduce-scatter+all-gather (FSDP)</div>
        <div className="text-muted-foreground">TP comm</div>
        <div className="text-right">all-reduce per layer (Megatron MLP block)</div>
        <div className="text-muted-foreground">PP comm</div>
        <div className="text-right">point-to-point send/recv on stage boundaries</div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        aria-label={label}
      />
    </div>
  );
}
