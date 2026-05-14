import { useMemo, useState } from "react";

/**
 * IsoflopCurve — compute-optimal (Chinchilla) vs inference-aware
 * (Sardana) parameter-count under a fixed training-compute budget.
 *
 * The slider sets log10(N_infer) — the number of inference tokens
 * expected to be served over the model's lifetime. As N_infer rises,
 * the lifecycle-optimal model shrinks (you want a smaller, more-trained
 * model when inference dominates). At N_infer ≪ D_train, the optimum
 * is Chinchilla's 20:1 token-per-parameter ratio; at N_infer ≫ D_train,
 * the optimum tilts toward severe over-training.
 *
 * Numbers are illustrative — anchored on the worked example from
 * 01c-scaling-laws.mdx (C = 1e25 FLOPs).
 */
export default function IsoflopCurve() {
  // C_train = 1e25 FLOPs ≈ Llama-3 405B budget
  // Chinchilla: N ≈ 300 B, D ≈ 5.5 T (T/P ≈ 18)
  // C = 6ND for dense, so for fixed C: D = C / (6N).
  // Inference-aware lifecycle cost ≈ C_train + 2·N·N_infer for dense.
  // Optimize ∂/∂N of total lifecycle loss + cost balance — illustrative.

  const [logNinfer, setLogNinfer] = useState(13); // log10(N_infer), default 1e13

  const W = 460;
  const H = 260;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Plot training loss-proxy vs N at fixed C_train = 1e25.
  // Use a Chinchilla-style L(N,D) = E + A/N^α + B/D^β with cherry-picked coefs
  // for clean visualisation (A=406.4, α=0.34, B=410.7, β=0.28, E=1.69)
  // Source: Hoffmann 2022 reported numbers (illustrative).
  const A = 406.4;
  const alpha = 0.34;
  const B = 410.7;
  const beta = 0.28;
  const E_irr = 1.69;
  const C = 1e25;
  const lossOf = (N: number) => {
    const D = C / (6 * N);
    return E_irr + A / Math.pow(N, alpha) + B / Math.pow(D, beta);
  };

  // Lifecycle "cost" proxy: training loss + λ · (N · N_infer)/(C_train),
  // where λ = 2/6 from the inference-vs-training FLOP ratio (illustrative).
  const N_infer = Math.pow(10, logNinfer);
  const lifecycleOf = (N: number) => {
    const trainPart = lossOf(N);
    // Map inference-cost share into "loss-equivalent units" via a small λ.
    const lambda = 1.2e-26; // calibrated so the slider produces a visible shift
    return trainPart + lambda * N * N_infer;
  };

  // N range: 1e10 to 1e12 in log
  const logNmin = 10;
  const logNmax = 12;
  const N_pts = 200;

  const sx = (logN: number) =>
    padL + ((logN - logNmin) / (logNmax - logNmin)) * innerW;

  // y range: auto-scale once across all curves
  const { trainPts, lifePts, yMin, yMax, trainArgmin, lifeArgmin } = useMemo(() => {
    const train: { logN: number; y: number }[] = [];
    const life: { logN: number; y: number }[] = [];
    for (let i = 0; i < N_pts; i++) {
      const logN = logNmin + (i / (N_pts - 1)) * (logNmax - logNmin);
      const Nval = Math.pow(10, logN);
      train.push({ logN, y: lossOf(Nval) });
      life.push({ logN, y: lifecycleOf(Nval) });
    }
    const all = train.map((p) => p.y).concat(life.map((p) => p.y));
    const yMin = Math.min(...all) - 0.02;
    const yMax = Math.max(...all) + 0.05;
    const trainArgmin = train.reduce((acc, p) => (p.y < acc.y ? p : acc), train[0]!);
    const lifeArgmin = life.reduce((acc, p) => (p.y < acc.y ? p : acc), life[0]!);
    return { trainPts: train, lifePts: life, yMin, yMax, trainArgmin, lifeArgmin };
  }, [logNinfer]);

  const sy = (y: number) =>
    padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const pathOf = (pts: { logN: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.logN).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" ");

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="IsoFLOP curve: training-loss-optimal vs lifecycle-optimal N at fixed compute"
        className="text-foreground"
      >
        {/* Axes */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        {/* x ticks at 10^10, 10^11, 10^12 */}
        {[10, 11, 12].map((t) => (
          <g key={`xt-${t}`}>
            <line
              x1={sx(t)}
              y1={H - padB - 3}
              x2={sx(t)}
              y2={H - padB + 3}
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <text
              x={sx(t)}
              y={H - padB + 14}
              textAnchor="middle"
              className="fill-current font-mono text-[9px]"
              style={{ opacity: 0.55 }}
            >
              10^{t}
            </text>
          </g>
        ))}
        <text
          x={W - padR}
          y={H - padB + 26}
          textAnchor="end"
          className="fill-current font-mono text-[9px]"
          style={{ opacity: 0.55 }}
        >
          N (params)
        </text>
        <text
          x={padL - 6}
          y={padT + 4}
          textAnchor="end"
          className="fill-current font-mono text-[9px]"
          style={{ opacity: 0.55 }}
        >
          loss-proxy
        </text>
        {/* Curves */}
        <path
          d={pathOf(trainPts)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d={pathOf(lifePts)}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
        />
        {/* Minima markers */}
        <circle
          cx={sx(trainArgmin.logN)}
          cy={sy(trainArgmin.y)}
          r={4}
          fill="currentColor"
        />
        <circle
          cx={sx(lifeArgmin.logN)}
          cy={sy(lifeArgmin.y)}
          r={4}
          fill="var(--color-primary)"
        />
      </svg>

      <div className="w-full flex flex-col gap-1 px-1">
        <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <span>log₁₀ N_infer (lifetime inference tokens)</span>
          <span className="tabular-nums text-foreground">
            10^{logNinfer.toFixed(1)}
          </span>
        </label>
        <input
          type="range"
          min={11}
          max={16}
          step={0.1}
          value={logNinfer}
          onChange={(e) => setLogNinfer(parseFloat(e.target.value))}
          className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          aria-label="Log10 of expected inference tokens"
        />
      </div>

      <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-current opacity-90" />
          training loss only (Chinchilla)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: "var(--color-primary)" }}
          />
          lifecycle (Sardana)
        </span>
      </div>
    </div>
  );
}
