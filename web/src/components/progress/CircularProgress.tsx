/**
 * CircularProgress — SVG ring meter for the dashboard overall progress.
 * Custom SVG (not shadcn Progress) per spec §8.
 */

import { cn } from "@/lib/utils";

interface Props {
  /** 0–100 percentage value */
  pct: number;
  /** Diameter of the circle in pixels */
  size?: number;
  /** Stroke width of the ring */
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  pct,
  size = 120,
  strokeWidth = 8,
  className,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring — primary accent, starts from top */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--ring)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-foreground leading-none">
          {pct}%
        </span>
      </div>
    </div>
  );
}
