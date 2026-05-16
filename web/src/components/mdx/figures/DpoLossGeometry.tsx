import { useMemo, useState } from "react";

/**
 * DpoLossGeometry — the DPO loss as a function of the implicit reward margin.
 *
 * The DPO objective reduces to:
 *   L_DPO = −E[ log σ( β · (logπ_θ(y_w|x)/π_ref(y_w|x) − logπ_θ(y_l|x)/π_ref(y_l|x)) ) ]
 *
 * Let m = (logπ_θ(y_w|x) − logπ_ref(y_w|x)) − (logπ_θ(y_l|x) − logπ_ref(y_l|x))
 * be the "policy-vs-reference log-ratio margin." The loss is −log σ(β·m).
 *
 * This figure plots that loss as a function of m for several β values.
 * The reader sees: (i) DPO is just BCE on a transformed margin, (ii) larger β
 * sharpens the loss around m=0 (stronger reward signal, more reward-hacking
 * pressure), (iii) the loss is zero only at m=∞ (always more pressure to
 * separate winners from losers).
 *
 * Cursor follows a slider on m; a callout shows the implicit reward gap.
 */
export default function DpoLossGeometry() {
  const [m, setM] = useState(0.5);

  const W = 540;
  const H = 270;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xMin = -3, xMax = 3;
  const yMin = 0, yMax = 4;

  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const betas = [0.1, 0.5, 1.0, 3.0];
  const colors = [
    "color-mix(in oklch, var(--color-foreground) 35%, transparent)",
    "var(--color-primary)",
    "var(--color-warning)",
    "var(--color-success)",
  ];

  const lossFn = (beta: number) => (mm: number) => {
    // −log σ(β·m) = log(1 + exp(−β·m))
    const z = -beta * mm;
    if (z > 50) return z; // avoid overflow
    return Math.log1p(Math.exp(z));
  };

  const N = 201;
  const paths = useMemo(() => {
    return betas.map((b, i) => {
      const fn = lossFn(b);
      const pts: string[] = [];
      for (let s = 0; s < N; s++) {
        const x = xMin + (s / (N - 1)) * (xMax - xMin);
        const y = Math.min(yMax, fn(x));
        pts.push(`${s === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
      }
      return { beta: b, color: colors[i]!, d: pts.join(" ") };
    });
  }, []);

  // Cursor: show loss at β=1.0 (canonical) and the implicit reward at current m
  const cursor = useMemo(
    () => betas.map((b) => ({ beta: b, y: lossFn(b)(m) })),
    [m],
  );

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="DPO loss as a function of log-ratio margin" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={sx(0)} y1={padT} x2={sx(0)} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* x ticks */}
        {[-2, -1, 1, 2].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={sy(0) - 3} x2={sx(t)} y2={sy(0) + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={sy(0) + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}</text>
          </g>
        ))}
        {/* y ticks */}
        {[1, 2, 3].map((t) => (
          <g key={`y-${t}`}>
            <line x1={sx(0) - 3} y1={sy(t)} x2={sx(0) + 3} y2={sy(t)} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(0) - 6} y={sy(t) + 3} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}</text>
          </g>
        ))}
        <text x={W - padR} y={sy(0) + 22} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.6 }}>
          margin m = Δ(logπ_θ − logπ_ref)
        </text>
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>−log σ(β·m)</text>

        {/* curves */}
        {paths.map((p) => (
          <path key={p.beta} d={p.d} fill="none" stroke={p.color} strokeWidth="2" />
        ))}

        {/* cursor */}
        <line x1={sx(m)} y1={padT} x2={sx(m)} y2={H - padB} stroke="var(--color-warning)" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="3 3" />
        {cursor.map((c, i) => (
          <circle key={i} cx={sx(m)} cy={sy(Math.min(yMax, c.y))} r={3.5} fill={colors[i]!} stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.8" />
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
        {betas.map((b, i) => (
          <span key={b} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: colors[i]! }} />
            β = {b}
          </span>
        ))}
      </div>

      <div className="px-1">
        <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
          <span>margin m</span>
          <span className="tabular-nums text-foreground">{m.toFixed(2)}</span>
        </label>
        <input type="range" min={-3} max={3} step={0.05} value={m} onChange={(e) => setM(parseFloat(e.target.value))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Log-ratio margin" />
        <p className="text-[10px] font-mono text-muted-foreground mt-1">
          m &gt; 0 ⇒ policy already prefers y_w over y_l more than reference did; m &lt; 0 ⇒ it prefers y_l (loss is large).
        </p>
      </div>
    </div>
  );
}
