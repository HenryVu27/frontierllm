/**
 * ExpertParallelRouting — the all-to-all token-dispatch pattern that defines
 * expert parallelism.
 *
 * Each device hosts a disjoint shard of experts; tokens live wherever they
 * arrived. Routing produces a (device × expert) sparse pattern. The dispatch
 * step is an all-to-all that moves each token to the device that owns its
 * chosen expert. After expert compute, a second all-to-all returns results.
 *
 * Layout: two device rows (top = "tokens before all-to-all #1", bottom =
 * "experts after"). Arrows cross between rows showing which tokens move to
 * which device. Token color encodes its assigned expert.
 *
 * 4 devices × 2 experts each = 8 experts total · top-1 routing for clarity.
 */
const N_DEV = 4;
const TOKENS_PER_DEV = 4;

// Hand-picked routing so the diagram has a mix of local (same-device) and
// cross-device traffic. Each entry is the expert ID 0..7 that token (dev,i)
// chose; the device that hosts expert e is floor(e/2).
const ROUTING: number[][] = [
  [0, 3, 5, 1],
  [4, 2, 0, 6],
  [7, 5, 3, 0],
  [2, 1, 6, 4],
];

export default function ExpertParallelRouting() {
  const W = 620;
  const H = 320;
  const padX = 30;
  const topY = 60;
  const botY = H - 80;
  const devW = (W - 2 * padX) / N_DEV;

  // Colors per expert (8 experts cycle through 4 hues)
  const expertColor = (e: number) => {
    const palette = [
      "var(--color-primary)",
      "var(--color-warning)",
      "var(--color-success)",
      "color-mix(in oklch, var(--color-foreground) 60%, transparent)",
    ];
    return palette[e % palette.length];
  };

  const tokenSlot = (dev: number, i: number) => {
    const cx = padX + dev * devW + (i + 0.5) * (devW / TOKENS_PER_DEV);
    return cx;
  };

  // Bottom row: each device shows its 2 expert slots
  const expertSlot = (e: number) => {
    const dev = Math.floor(e / 2);
    const local = e % 2;
    return padX + dev * devW + (local + 0.5) * (devW / 2);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Expert parallel all-to-all token dispatch"
      className="w-full max-w-[620px] text-foreground"
    >
      <defs>
        <marker id="ep-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Top: device labels + token row */}
      <text x={W / 2} y={20} textAnchor="middle" className="fill-current font-mono text-[11px] uppercase tracking-wider" style={{ opacity: 0.6 }}>
        before all-to-all  —  tokens live where they arrived
      </text>
      {Array.from({ length: N_DEV }).map((_, d) => {
        const x0 = padX + d * devW;
        return (
          <g key={`top-${d}`}>
            <rect x={x0 + 4} y={topY - 28} width={devW - 8} height={50} rx={6} fill="var(--color-card)" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <text x={x0 + devW / 2} y={topY - 14} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">
              GPU {d}
            </text>
            {ROUTING[d]!.map((e, i) => {
              const cx = tokenSlot(d, i);
              const cy = topY + 8;
              return (
                <g key={`tok-${d}-${i}`}>
                  <circle cx={cx} cy={cy} r={7} fill={expertColor(e)} stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
                  <text x={cx} y={cy + 3} textAnchor="middle" className="fill-current font-mono text-[8px] font-semibold" style={{ fill: "var(--color-background)" }}>
                    {e}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Center label */}
      <text x={W / 2} y={(topY + botY) / 2 - 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold" style={{ opacity: 0.7 }}>
        all-to-all dispatch
      </text>
      <text x={W / 2} y={(topY + botY) / 2 + 10} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>
        (count of cross-device arrows scales with mismatch between token-home and expert-home)
      </text>

      {/* Arrows: token → expert it routed to */}
      {ROUTING.flatMap((row, d) =>
        row.map((e, i) => {
          const x1 = tokenSlot(d, i);
          const y1 = topY + 16;
          const x2 = expertSlot(e);
          const y2 = botY - 16;
          const sameDev = Math.floor(e / 2) === d;
          return (
            <line
              key={`a-${d}-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={sameDev ? "currentColor" : expertColor(e)}
              strokeOpacity={sameDev ? 0.3 : 0.85}
              strokeWidth={sameDev ? 1 : 1.3}
              strokeDasharray={sameDev ? "3 3" : undefined}
              markerEnd="url(#ep-arrow)"
            />
          );
        }),
      )}

      {/* Bottom: experts */}
      {Array.from({ length: N_DEV }).map((_, d) => {
        const x0 = padX + d * devW;
        return (
          <g key={`bot-${d}`}>
            <rect x={x0 + 4} y={botY - 8} width={devW - 8} height={56} rx={6} fill="var(--color-card)" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <text x={x0 + devW / 2} y={botY + 42} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">
              GPU {d}
            </text>
            {[0, 1].map((local) => {
              const e = d * 2 + local;
              const cx = expertSlot(e);
              const cy = botY + 12;
              return (
                <g key={`exp-${e}`}>
                  <rect x={cx - 22} y={cy - 10} width={44} height={20} rx={4} fill={`color-mix(in oklch, ${expertColor(e)} 22%, transparent)`} stroke={expertColor(e)} strokeWidth="1.3" />
                  <text x={cx} y={cy + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">
                    E{e}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* legend */}
      <g transform={`translate(${padX}, ${H - 14})`}>
        <line x1={0} y1={0} x2={16} y2={0} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
        <text x={22} y={3} className="fill-current text-[10px]" style={{ opacity: 0.7 }}>local (same GPU)</text>
        <line x1={140} y1={0} x2={156} y2={0} stroke="var(--color-warning)" strokeWidth="1.3" />
        <text x={162} y={3} className="fill-current text-[10px]" style={{ opacity: 0.7 }}>cross-device (counts toward all-to-all volume)</text>
      </g>
    </svg>
  );
}
