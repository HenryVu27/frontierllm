import { useMemo, useState } from "react";

/**
 * ActivationStats — per-layer activation/gradient norms with and without
 * normalization.
 *
 * X-axis: layer index 0..L-1
 * Y-axis: norm (log scale)
 *
 * Toggle between three regimes:
 *   • plain        — no LayerNorm/RMSNorm; activations explode or vanish
 *                     depending on init scale; gradients follow
 *   • pre-LN       — RMSNorm before each sub-block; norms stay roughly flat
 *   • post-LN      — original Transformer: norms grow late and gradients
 *                     vanish early (the GPT-1 → GPT-2 failure mode)
 *
 * The figure makes the "why pre-norm won" argument geometrically.
 */
type Regime = "plain" | "preln" | "postln";

const L = 40;

export default function ActivationStats() {
  const [regime, setRegime] = useState<Regime>("plain");

  const W = 540;
  const H = 270;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 38;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // y range in log10 of norm
  const yMin = -3, yMax = 5;
  const sx = (i: number) => padL + (i / (L - 1)) * innerW;
  const sy = (logn: number) => padT + innerH - ((logn - yMin) / (yMax - yMin)) * innerH;

  // Build curves per regime
  const { actCurve, gradCurve } = useMemo(() => {
    const act: number[] = [];
    const grad: number[] = [];
    for (let i = 0; i < L; i++) {
      if (regime === "plain") {
        // Tiny init -> activations decay with depth; gradients vanish
        act.push(-0.04 * i); // log10
        grad.push(-0.5 - 0.08 * i);
      } else if (regime === "preln") {
        // Norms stay roughly constant
        act.push(0 + 0.02 * Math.sin(i / 3));
        grad.push(-0.3 + 0.02 * Math.cos(i / 4));
      } else {
        // post-LN: activations grow late, gradients vanish at the head
        act.push(0.5 + 0.04 * i + 0.02 * Math.sin(i / 2));
        // Gradient magnitude smaller at deep layers (vanishing at the top)
        grad.push(-1.0 - 0.06 * (L - 1 - i));
      }
    }
    return { actCurve: act, gradCurve: grad };
  }, [regime]);

  const pathOf = (curve: number[]) =>
    curve.map((y, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ");

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(["plain", "preln", "postln"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegime(r)}
            className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (regime === r ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
            aria-pressed={regime === r}
          >
            {r === "plain" ? "no norm" : r === "preln" ? "Pre-LN (modern)" : "Post-LN (GPT-1)"}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Per-layer activation and gradient norms across normalization regimes" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {/* y ticks (log) */}
        {[-2, 0, 2, 4].map((t) => (
          <g key={`y-${t}`}>
            <line x1={padL - 3} y1={sy(t)} x2={padL + 3} y2={sy(t)} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={padL - 6} y={sy(t) + 3} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>10^{t}</text>
          </g>
        ))}
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>‖·‖</text>

        {/* x ticks */}
        {[0, 10, 20, 30, 39].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={H - padB - 3} x2={sx(t)} y2={H - padB + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}</text>
          </g>
        ))}
        <text x={W - padR} y={H - padB + 28} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.6 }}>layer index</text>

        {/* curves */}
        <path d={pathOf(actCurve)} fill="none" stroke="var(--color-primary)" strokeWidth="2" />
        <path d={pathOf(gradCurve)} fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeDasharray="4 3" />

        {/* annotations */}
        {regime === "plain" && (
          <text x={sx(L - 1) - 4} y={sy(actCurve[L - 1]!) - 6} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-warning)" }}>
            gradient vanishes
          </text>
        )}
        {regime === "postln" && (
          <text x={sx(L - 1) - 4} y={sy(gradCurve[L - 1]!) + 14} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-warning)" }}>
            gradient vanishes at head
          </text>
        )}
        {regime === "preln" && (
          <text x={sx(L / 2)} y={sy(0) - 8} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-success)" }}>
            flat across depth — trainable
          </text>
        )}
      </svg>

      <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4" style={{ background: "var(--color-primary)" }} />
          activation ‖x_ℓ‖
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: "var(--color-warning)", height: 0 }} />
          gradient ‖∂L/∂x_ℓ‖
        </span>
      </div>
    </div>
  );
}
