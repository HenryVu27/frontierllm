import { useState } from "react";

/**
 * RopeRotation — interactive RoPE position rotation for a single 2-D pair.
 *
 * Slide the position index m. The (q1, q2) pair rotates by angle m·θ,
 * giving the geometric picture of how RoPE encodes position as a rotation
 * applied before the dot product. The key insight visualised here: the
 * dot product between the rotated query and the rotated key depends only
 * on the *difference* in position indices, not the absolute positions.
 */
export default function RopeRotation() {
  const [m, setM] = useState(0);
  const [thetaIdx, setThetaIdx] = useState(2); // index into a discrete θ grid

  // RoPE base θ for a representative 2-D pair with d_h=64, base=10000.
  // θ_i = 10000^{-2i/d}; we expose a few slots.
  const thetaChoices = [
    { label: "θ = π/24 (slow)", value: Math.PI / 24 },
    { label: "θ = π/12", value: Math.PI / 12 },
    { label: "θ = π/6", value: Math.PI / 6 },
    { label: "θ = π/4 (fast)", value: Math.PI / 4 },
  ];
  const theta = thetaChoices[thetaIdx]?.value ?? Math.PI / 6;
  const angle = m * theta;

  const W = 360;
  const H = 280;
  const cx = W / 2;
  const cy = 130;
  const R = 90;

  // q starts at (1, 0); rotated by angle.
  const qx = cx + R * Math.cos(angle);
  const qy = cy - R * Math.sin(angle);

  // q reference (unrotated) for contrast
  const q0x = cx + R;
  const q0y = cy;

  return (
    <div className="w-full max-w-[380px] flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="RoPE rotation of a query-key pair at position m"
        className="text-foreground"
      >
        {/* Axes */}
        <line
          x1={cx - R - 16}
          y1={cy}
          x2={cx + R + 16}
          y2={cy}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <line
          x1={cx}
          y1={cy - R - 16}
          x2={cx}
          y2={cy + R + 16}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        {/* Unit circle */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        {/* Arc showing the swept angle */}
        <path
          d={`M ${cx + R * 0.45} ${cy} A ${R * 0.45} ${R * 0.45} 0 ${angle > Math.PI ? 1 : 0} 0 ${cx + R * 0.45 * Math.cos(angle)} ${cy - R * 0.45 * Math.sin(angle)}`}
          fill="none"
          stroke="var(--color-primary)"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        {/* Unrotated reference q */}
        <line
          x1={cx}
          y1={cy}
          x2={q0x}
          y2={q0y}
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle cx={q0x} cy={q0y} r={4} fill="currentColor" fillOpacity="0.35" />
        <text
          x={q0x + 8}
          y={q0y + 4}
          className="fill-current font-mono text-[10px]"
          style={{ opacity: 0.5 }}
        >
          q (m=0)
        </text>
        {/* Rotated q */}
        <line
          x1={cx}
          y1={cy}
          x2={qx}
          y2={qy}
          stroke="var(--color-primary)"
          strokeWidth="2"
        />
        <circle cx={qx} cy={qy} r={5} fill="var(--color-primary)" />
        <text
          x={qx + (qx > cx ? 8 : -32)}
          y={qy + (qy > cy ? 14 : -6)}
          className="fill-current font-mono text-[10px] font-medium"
          fill="var(--color-primary)"
        >
          q (m={m})
        </text>
        {/* Origin marker */}
        <circle cx={cx} cy={cy} r={2.5} fill="currentColor" fillOpacity="0.6" />
        {/* Angle readout */}
        <text
          x={W / 2}
          y={H - 14}
          textAnchor="middle"
          className="fill-current font-mono text-[11px]"
          style={{ opacity: 0.85 }}
        >
          angle = m · θ = {(angle / Math.PI).toFixed(2)}π
        </text>
      </svg>

      <div className="w-full flex flex-col gap-2 px-1">
        <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <span>position m</span>
          <span className="tabular-nums text-foreground">{m}</span>
        </label>
        <input
          type="range"
          min={0}
          max={64}
          step={1}
          value={m}
          onChange={(e) => setM(parseInt(e.target.value, 10))}
          className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          aria-label="Position index m"
        />
        <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mt-1">
          <span>frequency θ</span>
          <span className="tabular-nums text-foreground">
            {thetaChoices[thetaIdx]?.label}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={thetaChoices.length - 1}
          step={1}
          value={thetaIdx}
          onChange={(e) => setThetaIdx(parseInt(e.target.value, 10))}
          className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          aria-label="Rotation frequency theta"
        />
      </div>
    </div>
  );
}
