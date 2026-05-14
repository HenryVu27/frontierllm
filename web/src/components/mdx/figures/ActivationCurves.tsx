import { useMemo, useState } from "react";

/**
 * ActivationCurves — overlay of ReLU, GELU, SiLU/Swish, and SwiGLU's gate
 * activation on the same axes. Toggle each curve on/off via the legend
 * buttons. Used in 00e to make the "they all look similar near zero, they
 * all differ in the negative tail" point geometrically.
 */

type Curve = {
  key: string;
  label: string;
  fn: (x: number) => number;
  color: string;
};

const relu = (x: number) => Math.max(0, x);

// GELU (exact, using tanh approximation that is faster than erf)
const gelu = (x: number) => {
  const c = Math.sqrt(2 / Math.PI);
  return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * Math.pow(x, 3))));
};

// SiLU / Swish
const silu = (x: number) => x / (1 + Math.exp(-x));

const CURVES: Curve[] = [
  { key: "relu", label: "ReLU", fn: relu, color: "var(--color-muted-foreground)" },
  { key: "gelu", label: "GELU", fn: gelu, color: "var(--color-primary)" },
  { key: "silu", label: "SiLU / Swish", fn: silu, color: "var(--color-foreground)" },
];

export default function ActivationCurves() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    relu: true,
    gelu: true,
    silu: true,
  });

  const W = 460;
  const H = 260;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // x range: [-4, 4], y range: [-1, 4]
  const xMin = -4,
    xMax = 4;
  const yMin = -1,
    yMax = 4;
  const N = 161;

  const sx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) =>
    padT + innerH - ((y - yMin) / (yMax - yMin)) * innerH;

  const paths = useMemo(() => {
    return CURVES.map((c) => {
      const pts: string[] = [];
      for (let i = 0; i < N; i++) {
        const x = xMin + (i / (N - 1)) * (xMax - xMin);
        const y = c.fn(x);
        pts.push(`${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
      }
      return { key: c.key, d: pts.join(" "), color: c.color, label: c.label };
    });
  }, []);

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Activation function curves: ReLU, GELU, SiLU"
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
          x1={sx(0)}
          y1={padT}
          x2={sx(0)}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        {/* Ticks (x) */}
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <g key={`xt-${t}`}>
            <line
              x1={sx(t)}
              y1={sy(0) - 3}
              x2={sx(t)}
              y2={sy(0) + 3}
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <text
              x={sx(t)}
              y={sy(0) + 14}
              textAnchor="middle"
              className="fill-current font-mono text-[9px]"
              style={{ opacity: 0.55 }}
            >
              {t}
            </text>
          </g>
        ))}
        {/* Ticks (y) */}
        {[1, 2, 3].map((t) => (
          <g key={`yt-${t}`}>
            <line
              x1={sx(0) - 3}
              y1={sy(t)}
              x2={sx(0) + 3}
              y2={sy(t)}
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <text
              x={sx(0) - 6}
              y={sy(t) + 3}
              textAnchor="end"
              className="fill-current font-mono text-[9px]"
              style={{ opacity: 0.55 }}
            >
              {t}
            </text>
          </g>
        ))}
        {/* Curves */}
        {paths.map((p) =>
          enabled[p.key] ? (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth="2"
            />
          ) : null,
        )}
      </svg>

      <div className="w-full flex items-center justify-center gap-2 flex-wrap">
        {CURVES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() =>
              setEnabled((prev) => ({ ...prev, [c.key]: !prev[c.key] }))
            }
            className={
              "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " +
              (enabled[c.key]
                ? "border-foreground/40 bg-subtle/60 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")
            }
            aria-pressed={enabled[c.key]}
          >
            <span
              className="inline-block h-2 w-3 rounded-sm"
              style={{ backgroundColor: c.color }}
            />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
