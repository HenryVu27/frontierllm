import { useEffect, useMemo, useRef, useState } from "react";

/**
 * OptimizerTrajectory — SGD vs Momentum vs Adam vs RMSProp on a 2D loss
 * surface (Rosenbrock-like banana valley). Animate to play the optimizer
 * forward from a shared starting point, or step through manually.
 *
 * The narrow valley penalises optimizers with poor curvature handling
 * (vanilla SGD oscillates across the valley, slowly creeping along it).
 * Momentum smooths the oscillation; Adam additionally rescales per
 * coordinate and tends to take much more direct paths.
 */
type Method = "sgd" | "momentum" | "adam" | "rmsprop";

// Rosenbrock-style: f(x, y) = (1 - x)^2 + 30 * (y - x^2)^2  (mild "banana")
const lossFn = (x: number, y: number) => Math.pow(1 - x, 2) + 30 * Math.pow(y - x * x, 2);
const gradFn = (x: number, y: number): [number, number] => {
  const dy = 60 * (y - x * x);
  const dx = -2 * (1 - x) - 4 * 30 * x * (y - x * x);
  return [dx, dy];
};

const X0 = -1.4;
const Y0 = 1.4;
const STEPS = 220;

export default function OptimizerTrajectory() {
  const [enabled, setEnabled] = useState<Record<Method, boolean>>({
    sgd: true,
    momentum: true,
    adam: true,
    rmsprop: false,
  });
  const [step, setStep] = useState(STEPS);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Pre-compute trajectories
  const traj = useMemo(() => {
    const out: Record<Method, [number, number][]> = { sgd: [], momentum: [], adam: [], rmsprop: [] };

    // SGD
    {
      let x = X0, y = Y0;
      const lr = 0.005;
      out.sgd.push([x, y]);
      for (let i = 0; i < STEPS; i++) {
        const [gx, gy] = gradFn(x, y);
        x -= lr * gx;
        y -= lr * gy;
        out.sgd.push([x, y]);
      }
    }
    // Momentum
    {
      let x = X0, y = Y0;
      let vx = 0, vy = 0;
      const lr = 0.005, mom = 0.9;
      out.momentum.push([x, y]);
      for (let i = 0; i < STEPS; i++) {
        const [gx, gy] = gradFn(x, y);
        vx = mom * vx + gx;
        vy = mom * vy + gy;
        x -= lr * vx;
        y -= lr * vy;
        out.momentum.push([x, y]);
      }
    }
    // Adam
    {
      let x = X0, y = Y0;
      let mx = 0, my = 0, vxh = 0, vyh = 0;
      const lr = 0.06, b1 = 0.9, b2 = 0.999, eps = 1e-8;
      out.adam.push([x, y]);
      for (let i = 0; i < STEPS; i++) {
        const [gx, gy] = gradFn(x, y);
        mx = b1 * mx + (1 - b1) * gx;
        my = b1 * my + (1 - b1) * gy;
        vxh = b2 * vxh + (1 - b2) * gx * gx;
        vyh = b2 * vyh + (1 - b2) * gy * gy;
        const t = i + 1;
        const mxh = mx / (1 - Math.pow(b1, t));
        const myh = my / (1 - Math.pow(b1, t));
        const vxhh = vxh / (1 - Math.pow(b2, t));
        const vyhh = vyh / (1 - Math.pow(b2, t));
        x -= (lr * mxh) / (Math.sqrt(vxhh) + eps);
        y -= (lr * myh) / (Math.sqrt(vyhh) + eps);
        out.adam.push([x, y]);
      }
    }
    // RMSProp
    {
      let x = X0, y = Y0;
      let vxh = 0, vyh = 0;
      const lr = 0.02, decay = 0.9, eps = 1e-8;
      out.rmsprop.push([x, y]);
      for (let i = 0; i < STEPS; i++) {
        const [gx, gy] = gradFn(x, y);
        vxh = decay * vxh + (1 - decay) * gx * gx;
        vyh = decay * vyh + (1 - decay) * gy * gy;
        x -= (lr * gx) / (Math.sqrt(vxh) + eps);
        y -= (lr * gy) / (Math.sqrt(vyh) + eps);
        out.rmsprop.push([x, y]);
      }
    }
    return out;
  }, []);

  // Animation
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      if (now - last > 16) {
        setStep((s) => {
          if (s >= STEPS) {
            setPlaying(false);
            return STEPS;
          }
          return s + 1;
        });
        last = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const W = 540;
  const H = 320;
  const padL = 28;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // World coords
  const xMin = -1.7, xMax = 1.7;
  const yMin = -0.4, yMax = 1.8;
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  // Contour lines via marching: pre-compute a coarse grid and draw isolines
  // as polylines at fixed loss levels.
  const contours = useMemo(() => buildContours(60, 60, xMin, xMax, yMin, yMax, sx, sy), []);

  const colors: Record<Method, string> = {
    sgd: "color-mix(in oklch, var(--color-foreground) 60%, transparent)",
    momentum: "var(--color-warning)",
    adam: "var(--color-primary)",
    rmsprop: "var(--color-success)",
  };

  const labels: Record<Method, string> = {
    sgd: "SGD",
    momentum: "+ momentum",
    adam: "Adam",
    rmsprop: "RMSProp",
  };

  return (
    <div className="w-full max-w-[560px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Optimizer trajectories on a Rosenbrock-style loss surface" className="text-foreground">
        {/* contour grid */}
        <g opacity={0.4}>
          {contours.map((path, i) => (
            <path key={i} d={path} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.7" />
          ))}
        </g>

        {/* minimum at (1,1) */}
        <g>
          <line x1={sx(1) - 6} y1={sy(1)} x2={sx(1) + 6} y2={sy(1)} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
          <line x1={sx(1)} y1={sy(1) - 6} x2={sx(1)} y2={sy(1) + 6} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
          <text x={sx(1) + 10} y={sy(1) - 8} className="fill-current font-mono text-[9px]" style={{ opacity: 0.7 }}>minimum (1, 1)</text>
        </g>

        {/* trajectories */}
        {(Object.keys(traj) as Method[]).map((m) =>
          enabled[m] ? (
            <g key={m}>
              <path
                d={traj[m]
                  .slice(0, step + 1)
                  .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`)
                  .join(" ")}
                fill="none"
                stroke={colors[m]}
                strokeWidth="1.6"
              />
              {/* head dot */}
              {traj[m][step] && (
                <circle cx={sx(traj[m][step]![0])} cy={sy(traj[m][step]![1])} r={3.5} fill={colors[m]} stroke="var(--color-background)" strokeWidth="1.2" />
              )}
            </g>
          ) : null
        )}

        {/* start dot */}
        <circle cx={sx(X0)} cy={sy(Y0)} r={3.5} fill="var(--color-background)" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
        <text x={sx(X0) + 8} y={sy(Y0) - 6} className="fill-current font-mono text-[9px]" style={{ opacity: 0.7 }}>start</text>

        {/* axes */}
        <text x={W - padR} y={H - padB + 14} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>x</text>
        <text x={padL - 4} y={padT + 2} textAnchor="end" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>y</text>
      </svg>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {(Object.keys(labels) as Method[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setEnabled((p) => ({ ...p, [m]: !p[m] }))}
            className={"inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors duration-150 " + (enabled[m] ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground")}
            aria-pressed={enabled[m]}
          >
            <span className="inline-block h-2 w-3 rounded-sm" style={{ background: colors[m] }} />
            {labels[m]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 px-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>step</span>
            <span className="tabular-nums text-foreground">{step}/{STEPS}</span>
          </label>
          <input type="range" min={0} max={STEPS} step={1} value={step} onChange={(e) => { setPlaying(false); setStep(parseInt(e.target.value, 10)); }} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Step" />
        </div>
        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={() => { if (step >= STEPS) setStep(0); setPlaying((p) => !p); }}
            className="rounded-md border border-foreground/40 bg-subtle/60 px-3 py-1 font-mono text-[11px] text-foreground"
          >
            {playing ? "pause" : "play"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Marching-squares-ish contour builder: emit polyline pieces for fixed levels.
function buildContours(
  nx: number,
  ny: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  sx: (x: number) => number,
  sy: (y: number) => number,
): string[] {
  const levels = [0.1, 0.5, 1, 2, 5, 10, 20, 40, 80];
  const grid: number[][] = [];
  for (let j = 0; j <= ny; j++) {
    const row: number[] = [];
    for (let i = 0; i <= nx; i++) {
      const x = xMin + (i / nx) * (xMax - xMin);
      const y = yMin + (j / ny) * (yMax - yMin);
      row.push(lossFn(x, y));
    }
    grid.push(row);
  }
  const pathStrs: string[] = [];
  for (const L of levels) {
    let pieces = "";
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const v00 = grid[j]![i]!;
        const v10 = grid[j]![i + 1]!;
        const v01 = grid[j + 1]![i]!;
        const v11 = grid[j + 1]![i + 1]!;
        const cx0 = xMin + (i / nx) * (xMax - xMin);
        const cx1 = xMin + ((i + 1) / nx) * (xMax - xMin);
        const cy0 = yMin + (j / ny) * (yMax - yMin);
        const cy1 = yMin + ((j + 1) / ny) * (yMax - yMin);
        // For each cell, check which edges cross level L; connect midpoints.
        const pts: [number, number][] = [];
        const checkEdge = (vA: number, vB: number, xA: number, yA: number, xB: number, yB: number) => {
          if ((vA - L) * (vB - L) < 0) {
            const t = (L - vA) / (vB - vA);
            pts.push([xA + t * (xB - xA), yA + t * (yB - yA)]);
          }
        };
        checkEdge(v00, v10, cx0, cy0, cx1, cy0);
        checkEdge(v10, v11, cx1, cy0, cx1, cy1);
        checkEdge(v00, v01, cx0, cy0, cx0, cy1);
        checkEdge(v01, v11, cx0, cy1, cx1, cy1);
        if (pts.length === 2) {
          pieces += `M ${sx(pts[0]![0]).toFixed(1)} ${sy(pts[0]![1]).toFixed(1)} L ${sx(pts[1]![0]).toFixed(1)} ${sy(pts[1]![1]).toFixed(1)} `;
        }
      }
    }
    if (pieces) pathStrs.push(pieces);
  }
  return pathStrs;
}
