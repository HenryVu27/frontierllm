import { useMemo, useState } from "react";

/**
 * SpeculativeDecodingTimeline — draft model proposes k tokens, target verifies
 * all k in a single forward pass, accepts the longest matching prefix.
 *
 * Two rows: draft model timeline (top, short steps) and target model
 * timeline (bottom, long step that verifies k drafts at once).
 *
 * Configurable:
 *  • draft length k
 *  • acceptance rate α (probability each draft token matches target's argmax)
 *
 * Stats panel shows the expected speedup vs vanilla autoregressive decoding:
 *  speedup ≈ E[# accepted + 1] / (k · c + 1)   where c = draft_cost / target_cost
 */
export default function SpeculativeDecodingTimeline() {
  const [k, setK] = useState(4);
  const [alpha, setAlpha] = useState(0.7);

  // Cost ratio: draft is ~10× cheaper than target
  const c = 0.1;

  // Simulate a deterministic acceptance pattern based on α
  // We use a fixed seed so it doesn't jitter when other knobs change.
  const accepted = useMemo(() => {
    const seq: boolean[] = [];
    const rng = mulberry32(0xfeedbead + Math.round(alpha * 100));
    for (let i = 0; i < k; i++) seq.push(rng() < alpha);
    return seq;
  }, [k, alpha]);

  // Length of accepted prefix
  let prefix = 0;
  for (const ok of accepted) {
    if (ok) prefix++;
    else break;
  }
  // +1 bonus token from target's own prediction at the rejection point
  const tokensEmitted = prefix + 1;

  // Expected acceptance per the standard analysis: E[#accepted] = (1−α^{k+1})/(1−α) − 1
  // = sum_{i=1..k} α^i   when α < 1; for α=1, = k
  let expectedAccepted = 0;
  for (let i = 1; i <= k; i++) expectedAccepted += Math.pow(alpha, i);
  const expectedTokens = expectedAccepted + 1; // +1 for guaranteed target step

  // Walltime per step: target = 1, draft = c per token
  const speculativeTime = k * c + 1;
  const vanillaTimeForSameTokens = expectedTokens;
  const speedup = vanillaTimeForSameTokens / speculativeTime;

  // === Layout ===
  const W = 580;
  const H = 220;
  const padL = 60;
  const padR = 16;
  const padT = 30;

  // x-axis: time units; draft tokens have width c, target verify width 1
  const totalTime = speculativeTime + 0.3;
  const sx = (t: number) => padL + (t / totalTime) * (W - padL - padR);

  return (
    <div className="w-full max-w-[600px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Speculative decoding draft and verify timeline" className="text-foreground">
        {/* time axis */}
        <line x1={padL} y1={H - 30} x2={W - padR} y2={H - 30} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <text x={W - padR} y={H - 18} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.55 }}>time →</text>

        {/* row labels */}
        <text x={padL - 8} y={padT + 16} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>draft</text>
        <text x={padL - 8} y={padT + 76} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>target</text>

        {/* draft timeline: k little blocks of width c each */}
        {Array.from({ length: k }).map((_, i) => {
          const x0 = sx(i * c);
          const x1 = sx((i + 1) * c);
          return (
            <g key={`d-${i}`}>
              <rect x={x0 + 1} y={padT + 2} width={x1 - x0 - 2} height={26} rx={2} fill="color-mix(in oklch, var(--color-foreground) 8%, transparent)" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
              <text x={(x0 + x1) / 2} y={padT + 18} textAnchor="middle" className="fill-current font-mono text-[9px]">d{i + 1}</text>
            </g>
          );
        })}

        {/* target verify block: single wide block covering k*c .. k*c + 1 */}
        <rect x={sx(k * c) + 1} y={padT + 50} width={sx(k * c + 1) - sx(k * c) - 2} height={32} rx={3} fill="color-mix(in oklch, var(--color-primary) 22%, transparent)" stroke="var(--color-primary)" strokeWidth="1.3" />
        <text x={(sx(k * c) + sx(k * c + 1)) / 2} y={padT + 70} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">verify · 1 target forward</text>

        {/* draft token verdicts: ✓ / ✗ markers above target block */}
        {accepted.map((_ok, i) => {
          const xMid = sx(k * c) + ((i + 0.5) / k) * (sx(k * c + 1) - sx(k * c));
          const passed = i <= prefix - 1 ? true : i === prefix ? false : null;
          if (passed === null) return null;
          return (
            <g key={`v-${i}`}>
              <text x={xMid} y={padT + 100} textAnchor="middle" className="fill-current font-mono text-[12px] font-bold" style={{ fill: passed ? "var(--color-success)" : "var(--color-warning)" }}>
                {passed ? "✓" : "✗"}
              </text>
            </g>
          );
        })}

        {/* annotation: # tokens emitted this step */}
        <text x={sx(speculativeTime) + 4} y={padT + 18} className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>
          step emits {tokensEmitted} token{tokensEmitted === 1 ? "" : "s"}
        </text>
      </svg>

      <div className="rounded-md border border-border bg-card/40 p-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[10.5px] font-mono">
        <div className="text-muted-foreground">accepted prefix this step</div>
        <div className="text-right tabular-nums">{prefix} of {k}</div>
        <div className="text-muted-foreground">expected tokens / step</div>
        <div className="text-right tabular-nums">{expectedTokens.toFixed(2)}</div>
        <div className="text-muted-foreground">wallclock speedup vs vanilla</div>
        <div className="text-right tabular-nums font-semibold" style={{ color: "var(--color-primary)" }}>{speedup.toFixed(2)}×</div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>draft length k</span>
            <span className="tabular-nums text-foreground">{k}</span>
          </label>
          <input type="range" min={1} max={10} step={1} value={k} onChange={(e) => setK(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Draft length k" />
        </div>
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>acceptance α</span>
            <span className="tabular-nums text-foreground">{alpha.toFixed(2)}</span>
          </label>
          <input type="range" min={0.0} max={1.0} step={0.05} value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Acceptance rate alpha" />
        </div>
      </div>
    </div>
  );
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
