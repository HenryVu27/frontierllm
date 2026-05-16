/**
 * LabReleaseTimeline — horizontal timeline of model releases for a single lab.
 *
 * Reusable across the 06* frontier-lab chapters. Each chapter passes its own
 * release list. The viz reads as: time on x-axis (left → right), one dot per
 * release, model name above, parameter or capability hint below. Highlighted
 * releases (e.g., flagships) are drawn larger and in primary color; others
 * are smaller and muted. A vertical bar above each dot encodes model size
 * (or activated-params for MoE), drawn on a log scale so 1B and 1T fit on
 * the same axis.
 *
 * Usage in MDX:
 *   <LabReleaseTimeline
 *     releases={[
 *       { date: "2024-04", name: "Llama 3", sub: "8B / 70B", size: 70 },
 *       { date: "2024-07", name: "Llama 3.1", sub: "405B flagship", size: 405, highlight: true },
 *       ...
 *     ]}
 *   />
 */

export type Release = {
  date: string;     // ISO yyyy-mm
  name: string;
  sub?: string;     // size or capability hint
  size?: number;    // billions of params, for the bar height
  highlight?: boolean;
};

interface Props {
  releases: Release[];
}

export default function LabReleaseTimeline({ releases }: Props) {
  if (!releases || releases.length === 0) return null;

  // Sort by date
  const sorted = [...releases].sort((a, b) => a.date.localeCompare(b.date));

  // Date range
  const dateToMs = (d: string) => new Date(d + "-15").getTime();
  const t0 = dateToMs(sorted[0]!.date);
  const t1 = dateToMs(sorted[sorted.length - 1]!.date);
  const span = Math.max(t1 - t0, 1);

  const W = 640;
  const H = 240;
  const padL = 30;
  const padR = 30;
  const axisY = 150;
  const innerW = W - padL - padR;

  const sx = (d: string) => padL + ((dateToMs(d) - t0) / span) * innerW;

  // Size bar height (log scale, max 80px)
  const maxSize = Math.max(...sorted.map((r) => r.size ?? 0), 1);
  const sizeH = (s?: number) => {
    if (!s || s <= 0) return 0;
    return (Math.log10(s + 1) / Math.log10(maxSize + 1)) * 70;
  };

  // Year ticks
  const t0Year = new Date(t0).getUTCFullYear();
  const t1Year = new Date(t1).getUTCFullYear();
  const years: number[] = [];
  for (let y = t0Year; y <= t1Year; y++) years.push(y);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Lab release timeline"
      className="w-full max-w-[660px] text-foreground"
    >
      {/* axis */}
      <line x1={padL} y1={axisY} x2={W - padR} y2={axisY} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
      {/* axis arrow */}
      <polyline points={`${W - padR + 8},${axisY} ${W - padR},${axisY - 4} ${W - padR},${axisY + 4}`} fill="currentColor" fillOpacity="0.5" />

      {/* year ticks (only when spanning > 1 year) */}
      {years.length > 1 && years.map((y) => {
        const dt = new Date(Date.UTC(y, 0, 15)).getTime();
        if (dt < t0 || dt > t1) return null;
        const x = padL + ((dt - t0) / span) * innerW;
        return (
          <g key={y}>
            <line x1={x} y1={axisY - 3} x2={x} y2={axisY + 3} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
            <text x={x} y={axisY + 14} textAnchor="middle" className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>{y}</text>
          </g>
        );
      })}

      {sorted.map((r, i) => {
        const x = sx(r.date);
        // Alternate label position above/below to avoid overlap
        const above = i % 2 === 0;
        const labelY = above ? axisY - 36 : axisY + 36;
        const sizeBarH = sizeH(r.size);
        const dotR = r.highlight ? 5 : 3.5;

        return (
          <g key={`${r.date}-${r.name}-${i}`}>
            {/* size bar above (always above the axis, regardless of label position) */}
            {sizeBarH > 0 && (
              <line
                x1={x}
                y1={axisY - 8}
                x2={x}
                y2={axisY - 8 - sizeBarH}
                stroke={r.highlight ? "var(--color-primary)" : "currentColor"}
                strokeOpacity={r.highlight ? 0.85 : 0.4}
                strokeWidth={r.highlight ? 3 : 2}
              />
            )}
            {/* dot */}
            <circle
              cx={x}
              cy={axisY}
              r={dotR}
              fill={r.highlight ? "var(--color-primary)" : "var(--color-background)"}
              stroke={r.highlight ? "var(--color-primary)" : "currentColor"}
              strokeOpacity={r.highlight ? 1 : 0.6}
              strokeWidth="1.5"
            />
            {/* label */}
            <text
              x={x}
              y={labelY}
              textAnchor="middle"
              className="fill-current font-mono text-[10px]"
              style={{ fontWeight: r.highlight ? 600 : 500, opacity: r.highlight ? 1 : 0.85 }}
            >
              {r.name}
            </text>
            {r.sub && (
              <text
                x={x}
                y={labelY + (above ? -12 : 12)}
                textAnchor="middle"
                className="fill-current font-mono text-[8.5px]"
                style={{ opacity: 0.6 }}
              >
                {r.sub}
              </text>
            )}
            {/* date label small */}
            <text
              x={x}
              y={above ? axisY + 14 : axisY - 12}
              textAnchor="middle"
              className="fill-current font-mono text-[8px]"
              style={{ opacity: 0.5 }}
            >
              {fmtDate(r.date)}
            </text>
          </g>
        );
      })}

      {/* legend if any release carries size info */}
      {sorted.some((r) => r.size) && (
        <text x={padL} y={H - 10} className="fill-current font-mono text-[9px]" style={{ opacity: 0.55 }}>
          bar height ∝ log(params or activated-params) · highlighted = flagship
        </text>
      )}
    </svg>
  );
}

function fmtDate(d: string) {
  // d = "yyyy-mm"
  const [y, m] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mi = Math.max(1, Math.min(12, parseInt(m ?? "1", 10))) - 1;
  return `${months[mi]} ${y!.slice(2)}`;
}
