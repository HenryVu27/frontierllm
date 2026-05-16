import { useMemo, useState } from "react";

/**
 * RopeRotation — three coupled panels that actually convey what RoPE *does*:
 *
 *  Panel A · Relative-only property
 *    Two (q, k) pairs are placed at different absolute positions but the same
 *    relative offset Δm. As you slide the *shared* base position, both pairs
 *    march in lockstep — yet the angle *between* q and k in each pair, and
 *    therefore the dot product, stays identical. That is the punchline of
 *    the RoPE identity ⟨q̂_m, k̂_n⟩ = q^T R((n−m)θ) k.
 *
 *  Panel B · Multi-band frequency structure
 *    The d/2 frequency bands (θ_i = base^{−2i/d}) rotate simultaneously at
 *    log-spaced rates. Drag Δm to see fast bands lap many times while slow
 *    bands barely move — this is *why* high-frequency dimensions "wrap" at
 *    long contexts and motivate YaRN / NTK-aware / ABF scaling.
 *
 *  Panel C · Dot product as a function of relative distance
 *    Plot of ⟨q̂_m, k̂_n⟩ versus Δm for a fixed random (q, k). The oscillating,
 *    decaying envelope is what attention actually "sees" — the only picture
 *    that matters for the reader's intuition about RoPE in practice.
 */
export default function RopeRotation() {
  const HEAD_DIM = 16; // small enough to draw, large enough to feel realistic
  const BASE = 10_000;
  const NUM_BANDS = HEAD_DIM / 2;

  // θ_i = base^{-2i/d} for i = 0..d/2-1
  const thetas = useMemo(
    () =>
      Array.from(
        { length: NUM_BANDS },
        (_, i) => Math.pow(BASE, (-2 * i) / HEAD_DIM),
      ),
    [],
  );

  // Fixed pseudo-random query/key vectors for the dot-product panel.
  // Deterministic so the visualisation is stable across renders.
  const { qVec, kVec } = useMemo(() => {
    const rng = mulberry32(0xc0_ffee);
    const q: number[] = [];
    const k: number[] = [];
    for (let i = 0; i < HEAD_DIM; i++) {
      q.push(gaussian(rng));
      k.push(gaussian(rng));
    }
    return { qVec: q, kVec: k };
  }, []);

  // Shared sliders
  const [basePos, setBasePos] = useState(0); // absolute base position for Panel A
  const [delta, setDelta] = useState(8); // relative offset Δm used by A, B, C

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-6">
      {/* Panel A — relative-only property */}
      <PanelRelativeInvariance basePos={basePos} delta={delta} />

      {/* Panel B — multi-band frequency structure */}
      <PanelFrequencyBands thetas={thetas} delta={delta} />

      {/* Panel C — dot product vs Δm */}
      <PanelDotProductCurve qVec={qVec} kVec={kVec} thetas={thetas} delta={delta} />

      {/* Shared controls */}
      <div className="w-full flex flex-col gap-3 px-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>relative offset Δm</span>
            <span className="tabular-nums text-foreground">{delta}</span>
          </label>
          <input
            type="range"
            min={0}
            max={64}
            step={1}
            value={delta}
            onChange={(e) => setDelta(parseInt(e.target.value, 10))}
            className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label="Relative offset between query and key"
          />
        </div>
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>base position m (Panel A only)</span>
            <span className="tabular-nums text-foreground">{basePos}</span>
          </label>
          <input
            type="range"
            min={0}
            max={64}
            step={1}
            value={basePos}
            onChange={(e) => setBasePos(parseInt(e.target.value, 10))}
            className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label="Absolute base position"
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Panel A — relative-only property
   Two (q,k) pairs sit at different absolute positions but share Δm.
   The geometric angle between q and k inside each pair is the same.
   ────────────────────────────────────────────────────────────────────── */
function PanelRelativeInvariance({
  basePos,
  delta,
}: {
  basePos: number;
  delta: number;
}) {
  const W = 540;
  const H = 220;
  // Use a single representative θ for the geometry (a slow band, easy to see)
  const theta = Math.PI / 12;

  // Pair 1: q at m=basePos, k at n=basePos+Δm
  const m1 = basePos;
  const n1 = basePos + delta;
  // Pair 2: q at m=basePos+offset2, k at n=m2+Δm (different absolute, same Δm)
  const offset2 = 17;
  const m2 = basePos + offset2;
  const n2 = m2 + delta;

  // Same underlying (q,k) directions in both pairs (unit vectors at a baseline)
  const qBase = 0; // angle of q before rotation
  const kBase = Math.PI / 5; // angle of k before rotation (so kᵀq is nontrivial)

  const pair = (cx: number, cy: number, qAngBase: number, kAngBase: number, mIdx: number, nIdx: number, label: string) => {
    const R = 56;
    const qAng = qAngBase + mIdx * theta;
    const kAng = kAngBase + nIdx * theta;
    const qx = cx + R * Math.cos(qAng);
    const qy = cy - R * Math.sin(qAng);
    const kx = cx + R * Math.cos(kAng);
    const ky = cy - R * Math.sin(kAng);

    // Δ-angle arc between q and k (the angle that determines the inner product)
    const a0 = Math.min(qAng, kAng);
    const a1 = Math.max(qAng, kAng);
    const arcR = R * 0.32;
    const arcStart = `${cx + arcR * Math.cos(a0)},${cy - arcR * Math.sin(a0)}`;
    const arcEnd = `${cx + arcR * Math.cos(a1)},${cy - arcR * Math.sin(a1)}`;
    const largeArc = a1 - a0 > Math.PI ? 1 : 0;

    return (
      <g>
        {/* unit circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 4" />
        {/* axes */}
        <line x1={cx - R - 10} y1={cy} x2={cx + R + 10} y2={cy} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <line x1={cx} y1={cy - R - 10} x2={cx} y2={cy + R + 10} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        {/* q vector */}
        <line x1={cx} y1={cy} x2={qx} y2={qy} stroke="var(--color-primary)" strokeWidth="2" />
        <circle cx={qx} cy={qy} r={4} fill="var(--color-primary)" />
        <text x={qx + (qx > cx ? 6 : -16)} y={qy + (qy > cy ? 12 : -4)} className="fill-current font-mono text-[10px]" style={{ fill: "var(--color-primary)" }}>
          q_{mIdx}
        </text>
        {/* k vector */}
        <line x1={cx} y1={cy} x2={kx} y2={ky} stroke="var(--color-foreground)" strokeWidth="2" />
        <circle cx={kx} cy={ky} r={4} fill="currentColor" />
        <text x={kx + (kx > cx ? 6 : -16)} y={ky + (ky > cy ? 12 : -4)} className="fill-current font-mono text-[10px]">
          k_{nIdx}
        </text>
        {/* Δ-angle arc */}
        <path
          d={`M ${arcStart} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEnd}`}
          fill="none"
          stroke="var(--color-warning)"
          strokeOpacity="0.85"
          strokeWidth="2"
        />
        <text x={cx} y={cy + R + 26} textAnchor="middle" className="fill-current font-mono text-[11px] font-medium">
          {label}
        </text>
        <text x={cx} y={cy + R + 40} textAnchor="middle" className="fill-current font-mono text-[10px]" style={{ opacity: 0.65 }}>
          ∠(q,k) = Δm·θ
        </text>
      </g>
    );
  };

  return (
    <div className="w-full">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
        Panel A · relative-only property
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Two query-key pairs at different absolute positions but identical relative offset" className="text-foreground">
        {pair(135, 105, qBase, kBase, m1, n1, `pair 1 (m=${m1}, n=${n1})`)}
        {pair(405, 105, qBase, kBase, m2, n2, `pair 2 (m=${m2}, n=${n2})`)}
        <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-current text-[10px]" style={{ opacity: 0.7 }}>
          same Δm = {delta}  →  same ∠(q,k)  →  same ⟨q̂, k̂⟩, regardless of absolute position
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Panel B — multi-band frequency structure
   Show all d/2 bands rotating simultaneously, log-spaced frequencies.
   ────────────────────────────────────────────────────────────────────── */
function PanelFrequencyBands({ thetas, delta }: { thetas: number[]; delta: number }) {
  const W = 540;
  const H = 170;
  const N = thetas.length;
  const padX = 16;
  const r = 22;
  const stride = (W - 2 * padX) / N;

  return (
    <div className="w-full">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
        Panel B · d/2 = {N} frequency bands (log-spaced)
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Frequency bands rotating at different rates" className="text-foreground">
        {thetas.map((theta, i) => {
          const cx = padX + (i + 0.5) * stride;
          const cy = 70;
          // Total angle swept by this band at offset Δm
          const angle = delta * theta;
          const qx = cx + r * Math.cos(angle);
          const qy = cy - r * Math.sin(angle);
          // Wavelength in tokens: 2π/θ
          const wavelength = (2 * Math.PI) / theta;
          // "Wraps" so far
          const wraps = angle / (2 * Math.PI);
          // Highlight bands whose angle exceeds π (they've gone past distinguishability)
          const wrapped = Math.abs(angle) > Math.PI;

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={wrapped ? 0.35 : 0.18} strokeWidth="1" strokeDasharray="2 3" />
              <line x1={cx} y1={cy} x2={qx} y2={qy} stroke={wrapped ? "var(--color-warning)" : "var(--color-primary)"} strokeWidth="1.8" />
              <circle cx={qx} cy={qy} r={2.5} fill={wrapped ? "var(--color-warning)" : "var(--color-primary)"} />
              <text x={cx} y={cy + r + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.7 }}>
                λ={wavelength < 1000 ? wavelength.toFixed(1) : wavelength.toExponential(0)}
              </text>
              <text x={cx} y={cy + r + 26} textAnchor="middle" className="fill-current font-mono text-[8px]" style={{ opacity: 0.5 }}>
                {wraps.toFixed(2)}×
              </text>
            </g>
          );
        })}
        <text x={padX} y={H - 6} className="fill-current text-[10px]" style={{ opacity: 0.6 }}>
          λ = 2π/θ (tokens per cycle) · highlighted bands have rotated past π — wrapped at this Δm
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Panel C — ⟨q̂_m, k̂_n⟩ vs Δm
   The thing attention actually sees.
   ────────────────────────────────────────────────────────────────────── */
function PanelDotProductCurve({
  qVec,
  kVec,
  thetas,
  delta,
}: {
  qVec: number[];
  kVec: number[];
  thetas: number[];
  delta: number;
}) {
  const W = 540;
  const H = 180;
  const padL = 38;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const dMin = 0;
  const dMax = 128;
  const samples = 257;

  // Apply rotation to (q,k) pairs and compute dot product as function of Δ
  const series = useMemo(() => {
    const pts: { d: number; y: number }[] = [];
    for (let s = 0; s < samples; s++) {
      const d = dMin + (s / (samples - 1)) * (dMax - dMin);
      // ⟨R(Δm·θ_i) q_i, k_i⟩ summed across all i bands.
      // After applying the rotation identity, the per-band contribution is
      // q_i^T R(Δm·θ_i) k_i where (q_i, k_i) are 2-vectors.
      let sum = 0;
      for (let i = 0; i < thetas.length; i++) {
        const t = d * thetas[i]!;
        const c = Math.cos(t);
        const sn = Math.sin(t);
        const q1 = qVec[2 * i]!;
        const q2 = qVec[2 * i + 1]!;
        const k1 = kVec[2 * i]!;
        const k2 = kVec[2 * i + 1]!;
        // R(t)·k = [c·k1 - sn·k2, sn·k1 + c·k2]; q·R(t)·k:
        sum += q1 * (c * k1 - sn * k2) + q2 * (sn * k1 + c * k2);
      }
      pts.push({ d, y: sum });
    }
    return pts;
  }, [qVec, kVec, thetas]);

  const ys = series.map((p) => p.y);
  const yMin = Math.min(...ys) - 0.5;
  const yMax = Math.max(...ys) + 0.5;

  const sx = (d: number) => padL + ((d - dMin) / (dMax - dMin)) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const path = series.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.d).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");

  // Cursor at current Δm
  const cursor = series[Math.min(samples - 1, Math.round((delta - dMin) / (dMax - dMin) * (samples - 1)))]!;

  return (
    <div className="w-full">
      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
        Panel C · ⟨q̂_m, k̂_n⟩ as a function of Δm (what attention actually sees)
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Dot product of rotated query and key as a function of relative distance" className="text-foreground">
        {/* axes */}
        <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        {/* x ticks */}
        {[0, 32, 64, 96, 128].map((t) => (
          <g key={`x-${t}`}>
            <line x1={sx(t)} y1={sy(0) - 3} x2={sx(t)} y2={sy(0) + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={sx(t)} y={H - padB + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{t}</text>
          </g>
        ))}
        <text x={W - padR} y={H - padB + 14} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>Δm</text>
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>⟨q̂,k̂⟩</text>

        {/* curve */}
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="1.8" />

        {/* cursor at current Δm */}
        <line x1={sx(cursor.d)} y1={padT} x2={sx(cursor.d)} y2={H - padB} stroke="var(--color-warning)" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx={sx(cursor.d)} cy={sy(cursor.y)} r={4} fill="var(--color-warning)" />
        <text x={sx(cursor.d) + 6} y={sy(cursor.y) - 6} className="fill-current font-mono text-[10px] font-medium" style={{ fill: "var(--color-warning)" }}>
          Δm={delta}, ⟨q̂,k̂⟩={cursor.y.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}

// Small deterministic RNG so the figure is stable.
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
function gaussian(rng: () => number) {
  // Box–Muller
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
