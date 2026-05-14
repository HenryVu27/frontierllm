import { useMemo, useState } from "react";

/**
 * ScheduleOverlay — interactive LR schedule comparison: cosine vs WSD vs
 * constant-then-decay. Sliders adjust warmup fraction and decay-tail
 * fraction. The y-axis is η / η_max so the schedules are visually
 * comparable regardless of peak LR.
 */
export default function ScheduleOverlay() {
  const [warmupFrac, setWarmupFrac] = useState(0.02);
  const [decayFrac, setDecayFrac] = useState(0.1);

  const W = 460;
  const H = 240;
  const padL = 36;
  const padR = 16;
  const padT = 14;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const sx = (t: number) => padL + t * innerW;
  const sy = (eta: number) => padT + innerH - eta * innerH;

  const N = 240;
  const ts = useMemo(() => Array.from({ length: N }, (_, i) => i / (N - 1)), []);

  // Warmup ramps 0→1 over [0, w]. After that, three schedules.
  const cosineY = (t: number, w: number) => {
    if (t < w) return t / w;
    return 0.5 * (1 + Math.cos(Math.PI * ((t - w) / (1 - w))));
  };
  const wsdY = (t: number, w: number, d: number) => {
    if (t < w) return t / w;
    const stableEnd = 1 - d;
    if (t < stableEnd) return 1;
    return 1 - (t - stableEnd) / d; // linear decay tail
  };
  const constantY = (t: number, w: number) => {
    if (t < w) return t / w;
    return 1;
  };

  const cosinePath = useMemo(() => {
    const pts = ts.map((t, i) => {
      const y = cosineY(t, warmupFrac);
      return `${i === 0 ? "M" : "L"} ${sx(t).toFixed(1)} ${sy(y).toFixed(1)}`;
    });
    return pts.join(" ");
  }, [ts, warmupFrac]);

  const wsdPath = useMemo(() => {
    const pts = ts.map((t, i) => {
      const y = wsdY(t, warmupFrac, decayFrac);
      return `${i === 0 ? "M" : "L"} ${sx(t).toFixed(1)} ${sy(y).toFixed(1)}`;
    });
    return pts.join(" ");
  }, [ts, warmupFrac, decayFrac]);

  const constantPath = useMemo(() => {
    const pts = ts.map((t, i) => {
      const y = constantY(t, warmupFrac);
      return `${i === 0 ? "M" : "L"} ${sx(t).toFixed(1)} ${sy(y).toFixed(1)}`;
    });
    return pts.join(" ");
  }, [ts, warmupFrac]);

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Learning-rate schedule overlay: cosine, WSD, constant"
        className="text-foreground"
      >
        {/* Axes */}
        <line
          x1={padL}
          y1={sy(0)}
          x2={W - padR}
          y2={sy(0)}
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
        {/* y axis label at top */}
        <text
          x={padL - 6}
          y={padT + 4}
          textAnchor="end"
          className="fill-current font-mono text-[9px]"
          style={{ opacity: 0.55 }}
        >
          η/η_max
        </text>
        <text
          x={padL - 6}
          y={sy(1) + 3}
          textAnchor="end"
          className="fill-current font-mono text-[9px]"
          style={{ opacity: 0.55 }}
        >
          1
        </text>
        <text
          x={W - padR}
          y={sy(0) + 14}
          textAnchor="end"
          className="fill-current font-mono text-[9px]"
          style={{ opacity: 0.55 }}
        >
          step / T
        </text>
        {/* Constant — drawn first / lightest */}
        <path
          d={constantPath}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        {/* WSD */}
        <path
          d={wsdPath}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
        />
        {/* Cosine */}
        <path
          d={cosinePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 px-1">
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>warmup fraction</span>
            <span className="tabular-nums text-foreground">
              {(warmupFrac * 100).toFixed(1)}%
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={0.1}
            step={0.005}
            value={warmupFrac}
            onChange={(e) => setWarmupFrac(parseFloat(e.target.value))}
            className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label="Warmup fraction"
          />
        </div>
        <div>
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>WSD decay tail</span>
            <span className="tabular-nums text-foreground">
              {(decayFrac * 100).toFixed(0)}%
            </span>
          </label>
          <input
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={decayFrac}
            onChange={(e) => setDecayFrac(parseFloat(e.target.value))}
            className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label="WSD decay tail fraction"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-current opacity-90" />
          cosine
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: "var(--color-primary)" }}
          />
          WSD
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-4 border-t-2 border-dashed border-current opacity-60"
            style={{ height: 0 }}
          />
          constant
        </span>
      </div>
    </div>
  );
}
