/**
 * LongContextStaging — horizontal timeline of continued-pretraining stages
 * extending base context length from 8k through 32k, 128k, and 1M.
 *
 * Each stage is a stop on a horizontal axis with the context length above
 * and an indicative token-budget label below. Numbers are illustrative
 * (Llama-3.1-style staging) but in the right ballpark for 2024-2026 frontier
 * recipes. See chapter 01g for the actual per-lab disclosures.
 */
export default function LongContextStaging() {
  const W = 580;
  const H = 200;
  const padX = 40;
  const axisY = 110;

  const stages = [
    { ctx: "8k", label: "Base pretraining", tokens: "~90% of D" },
    { ctx: "32k", label: "Stage 1 extension", tokens: "~80B" },
    { ctx: "128k", label: "Stage 2 extension", tokens: "~80B" },
    { ctx: "1M", label: "Stage 3 extension", tokens: "~40B" },
  ];
  const n = stages.length;
  const stride = (W - 2 * padX) / (n - 1);
  const xAt = (i: number) => padX + i * stride;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Long-context extension staging timeline"
      className="text-foreground max-w-[600px]"
    >
      {/* Axis line */}
      <line
        x1={padX - 12}
        y1={axisY}
        x2={W - padX + 12}
        y2={axisY}
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Right-end arrow */}
      <polyline
        points={`${W - padX + 12},${axisY} ${W - padX + 4},${axisY - 5} ${W - padX + 4},${axisY + 5}`}
        fill="currentColor"
        fillOpacity="0.55"
      />

      {stages.map((s, i) => {
        const x = xAt(i);
        return (
          <g key={i}>
            {/* Tick */}
            <line
              x1={x}
              y1={axisY - 6}
              x2={x}
              y2={axisY + 6}
              stroke="currentColor"
              strokeOpacity="0.55"
              strokeWidth="1.5"
            />
            {/* Context length above the axis */}
            <text
              x={x}
              y={axisY - 14}
              textAnchor="middle"
              className="fill-current font-mono text-[12px] font-medium"
            >
              {s.ctx}
            </text>
            {/* Stage label below the axis */}
            <text
              x={x}
              y={axisY + 24}
              textAnchor="middle"
              className="fill-current text-[11px]"
              style={{ opacity: 0.85 }}
            >
              {s.label}
            </text>
            {/* Indicative token budget */}
            <text
              x={x}
              y={axisY + 42}
              textAnchor="middle"
              className="fill-current font-mono text-[10px]"
              style={{ opacity: 0.6 }}
            >
              {s.tokens}
            </text>
          </g>
        );
      })}

      {/* Caption hint above */}
      <text
        x={W / 2}
        y={26}
        textAnchor="middle"
        className="fill-current text-[10px] uppercase tracking-wider"
        style={{ opacity: 0.55, letterSpacing: "0.08em" }}
      >
        Context length
      </text>
      {/* RoPE base-frequency hint */}
      <text
        x={W / 2}
        y={H - 18}
        textAnchor="middle"
        className="fill-current text-[10px]"
        style={{ opacity: 0.55 }}
      >
        RoPE base bumped at each stage (ABF, YaRN, or LongRoPE)
      </text>
    </svg>
  );
}
