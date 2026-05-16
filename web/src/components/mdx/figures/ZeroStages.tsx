/**
 * ZeroStages — what gets sharded across DP ranks at ZeRO stages 0/1/2/3.
 *
 * Four stacked rows (one per stage). Each row shows three resource buckets —
 * Optimizer state · Gradients · Parameters — colored green if replicated on
 * every rank, and split into N colored slices (one per rank) if sharded.
 *
 * Memory per rank shrinks roughly as:
 *   stage 0 → 16ψ           (DDP)
 *   stage 1 → 12ψ + 4ψ/N    (optimizer states sharded)
 *   stage 2 → 12ψ + 6ψ/N    (+ grads sharded)
 *   stage 3 →  2ψ + 14ψ/N   (+ params sharded; FSDP)
 *
 * (Coefficients assume mixed-precision Adam with master fp32 weights.)
 */
const N_RANKS = 4;

const STAGES = [
  { name: "ZeRO-0 (DDP)", short: "every rank holds a full copy", opt: false, grad: false, param: false, mem: "16ψ" },
  { name: "ZeRO-1", short: "optimizer states sharded", opt: true, grad: false, param: false, mem: "12ψ + 4ψ/N" },
  { name: "ZeRO-2", short: "+ gradients sharded", opt: true, grad: true, param: false, mem: "12ψ + 6ψ/N" },
  { name: "ZeRO-3 / FSDP", short: "+ parameters sharded", opt: true, grad: true, param: true, mem: "2ψ + 14ψ/N" },
];

export default function ZeroStages() {
  const W = 600;
  const rowH = 70;
  const H = STAGES.length * rowH + 50;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="ZeRO memory partitioning stages 0 through 3"
      className="w-full max-w-[600px] text-foreground"
    >
      {/* header */}
      <text x={188} y={20} textAnchor="middle" className="fill-current font-mono text-[10px] uppercase tracking-wider" style={{ opacity: 0.55 }}>
        Optimizer states
      </text>
      <text x={328} y={20} textAnchor="middle" className="fill-current font-mono text-[10px] uppercase tracking-wider" style={{ opacity: 0.55 }}>
        Gradients
      </text>
      <text x={468} y={20} textAnchor="middle" className="fill-current font-mono text-[10px] uppercase tracking-wider" style={{ opacity: 0.55 }}>
        Parameters
      </text>

      {STAGES.map((s, i) => {
        const y = 40 + i * rowH;
        return (
          <g key={s.name} transform={`translate(0, ${y})`}>
            {/* row label */}
            <text x={14} y={28} className="fill-current text-[12px] font-semibold">{s.name}</text>
            <text x={14} y={44} className="fill-current text-[10px]" style={{ opacity: 0.6 }}>{s.short}</text>
            <text x={14} y={58} className="fill-current font-mono text-[10px]" style={{ opacity: 0.75 }}>per-rank ≈ {s.mem}</text>

            <Bucket x={140} y={12} sharded={s.opt} />
            <Bucket x={280} y={12} sharded={s.grad} />
            <Bucket x={420} y={12} sharded={s.param} />

            {/* row separator */}
            {i < STAGES.length - 1 && (
              <line x1={10} y1={rowH - 2} x2={W - 10} y2={rowH - 2} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Bucket({ x, y, sharded }: { x: number; y: number; sharded: boolean }) {
  const w = 96;
  const h = 36;
  if (!sharded) {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={0} y={0} width={w} height={h} rx={5} fill="color-mix(in oklch, var(--color-success) 22%, transparent)" stroke="var(--color-success)" strokeWidth="1.4" />
        <text x={w / 2} y={h / 2 + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">replicated ×N</text>
      </g>
    );
  }
  const sliceW = (w - (N_RANKS - 1) * 2) / N_RANKS;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: N_RANKS }).map((_, i) => (
        <rect
          key={i}
          x={i * (sliceW + 2)}
          y={0}
          width={sliceW}
          height={h}
          rx={3}
          fill="color-mix(in oklch, var(--color-primary) 22%, transparent)"
          stroke="var(--color-primary)"
          strokeWidth="1.3"
        />
      ))}
      <text x={w / 2} y={h / 2 + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">sharded /N</text>
    </g>
  );
}
