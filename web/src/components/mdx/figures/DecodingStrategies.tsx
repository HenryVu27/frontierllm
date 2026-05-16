import { useMemo, useState } from "react";

/**
 * DecodingStrategies — interactive sampling-distribution explorer.
 *
 * The figure shows a fixed logit distribution over a small "vocab" (10
 * candidate tokens) and how three controls reshape the probability mass
 * that decoding actually samples from:
 *
 *  • temperature  T   — divides logits before softmax
 *  • top-k        k   — keeps the k most-likely tokens
 *  • top-p (nucleus)  — keeps the smallest prefix whose cumulative mass ≥ p
 *
 * Bars show post-softmax probability; greyed-out bars are filtered by top-k
 * or top-p and will receive zero sample probability after renormalisation.
 * A live entropy readout helps the reader connect the shape change to
 * "diversity vs determinism."
 */
type Strategy = "topk" | "topp";

const VOCAB = ["the", "a", "cat", "dog", "ran", "jumped", "house", "fast", "happily", "moon"];
const LOGITS = [3.1, 2.7, 2.2, 1.8, 1.4, 0.9, 0.4, -0.2, -0.9, -1.6];

export default function DecodingStrategies() {
  const [T, setT] = useState(1.0);
  const [strategy, setStrategy] = useState<Strategy>("topp");
  const [topK, setTopK] = useState(5);
  const [topP, setTopP] = useState(0.9);

  // Apply temperature → softmax
  const { probs, entropy, keepMask } = useMemo(() => {
    const scaled = LOGITS.map((l) => l / Math.max(0.01, T));
    const maxL = Math.max(...scaled);
    const exps = scaled.map((l) => Math.exp(l - maxL));
    const Z = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((e) => e / Z);

    // Build keep mask for top-k or top-p over current probs
    const sortedIdx = probs.map((_, i) => i).sort((a, b) => probs[b]! - probs[a]!);
    let keep = new Set<number>();
    if (strategy === "topk") {
      sortedIdx.slice(0, topK).forEach((i) => keep.add(i));
    } else {
      let cum = 0;
      for (const i of sortedIdx) {
        keep.add(i);
        cum += probs[i]!;
        if (cum >= topP) break;
      }
    }
    // Entropy of *renormalized kept* distribution
    let entSum = 0;
    let keptMass = 0;
    for (const i of keep) keptMass += probs[i]!;
    for (const i of keep) {
      const p = probs[i]! / Math.max(1e-12, keptMass);
      if (p > 0) entSum -= p * Math.log2(p);
    }
    return { probs, entropy: entSum, keepMask: keep };
  }, [T, strategy, topK, topP]);

  // Renormalised probs after filter
  const renorm = useMemo(() => {
    const total = Array.from(keepMask).reduce((s, i) => s + probs[i]!, 0);
    return probs.map((p, i) => (keepMask.has(i) ? p / Math.max(1e-12, total) : 0));
  }, [probs, keepMask]);

  const W = 540;
  const H = 280;
  const padL = 28;
  const padR = 16;
  const padT = 16;
  const padB = 80;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const bandW = innerW / VOCAB.length;
  const barW = bandW * 0.66;

  const sx = (i: number) => padL + i * bandW + (bandW - barW) / 2;
  const maxP = Math.max(...probs);
  const sy = (p: number) => padT + innerH - (p / maxP) * innerH;

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Decoding strategy distribution" className="text-foreground">
        {/* baseline */}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />

        {probs.map((p, i) => {
          const x = sx(i);
          const y = sy(p);
          const h = padT + innerH - y;
          const kept = keepMask.has(i);
          const rp = renorm[i]!;
          return (
            <g key={i}>
              {/* light grey "original" bar */}
              <rect x={x} y={y} width={barW} height={h} rx={2} fill="color-mix(in oklch, var(--color-foreground) 8%, transparent)" stroke="currentColor" strokeOpacity={kept ? 0.55 : 0.25} strokeWidth="1" />
              {/* renormalised colored bar overlay if kept */}
              {kept && (
                <rect
                  x={x}
                  y={padT + innerH - (rp / maxP) * innerH}
                  width={barW}
                  height={(rp / maxP) * innerH}
                  rx={2}
                  fill="color-mix(in oklch, var(--color-primary) 28%, transparent)"
                  stroke="var(--color-primary)"
                  strokeWidth="1.2"
                />
              )}
              {/* token label */}
              <text x={x + barW / 2} y={padT + innerH + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: kept ? 0.9 : 0.45 }}>
                {VOCAB[i]}
              </text>
              {/* % label */}
              <text x={x + barW / 2} y={padT + innerH + 26} textAnchor="middle" className="fill-current font-mono text-[8.5px]" style={{ opacity: kept ? 0.85 : 0.4, fontVariantNumeric: "tabular-nums" }}>
                {(rp * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* readout */}
        <text x={padL} y={H - 14} className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>
          kept tokens: <tspan className="font-semibold" style={{ fill: "var(--color-primary)" }}>{keepMask.size}</tspan>
          {" · "}entropy of sampled dist: <tspan className="font-semibold" style={{ fill: "var(--color-primary)" }}>{entropy.toFixed(2)}</tspan> bits
        </text>
      </svg>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setStrategy("topk")}
          className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (strategy === "topk" ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
          aria-pressed={strategy === "topk"}
        >
          top-k
        </button>
        <button
          type="button"
          onClick={() => setStrategy("topp")}
          className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (strategy === "topp" ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
          aria-pressed={strategy === "topp"}
        >
          top-p (nucleus)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 px-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>temperature T</span>
            <span className="tabular-nums text-foreground">{T.toFixed(2)}</span>
          </label>
          <input type="range" min={0.1} max={2.0} step={0.05} value={T} onChange={(e) => setT(parseFloat(e.target.value))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Temperature" />
        </div>
        {strategy === "topk" ? (
          <div>
            <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
              <span>top-k</span>
              <span className="tabular-nums text-foreground">{topK}</span>
            </label>
            <input type="range" min={1} max={VOCAB.length} step={1} value={topK} onChange={(e) => setTopK(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Top-k" />
          </div>
        ) : (
          <div>
            <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
              <span>top-p</span>
              <span className="tabular-nums text-foreground">{topP.toFixed(2)}</span>
            </label>
            <input type="range" min={0.1} max={1.0} step={0.01} value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Top-p" />
          </div>
        )}
      </div>
    </div>
  );
}
