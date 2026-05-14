/**
 * DataPipelineFlow — Common Crawl → extraction → filtering → dedup → mix.
 *
 * Linear horizontal flow with shrinking "token-volume" rectangles to show the
 * yield reduction at each stage. Numbers are illustrative (Common Crawl pool
 * → multi-trillion token output) but in the right ballpark for FineWeb/DCLM.
 */
export default function DataPipelineFlow() {
  const W = 580;
  const H = 220;

  // 6 stages, each with a label and a "yield bar" height proportional to log scale
  const stages = [
    { name: "Common Crawl", sub: "WARC, ~250 TB/mo", h: 90, tokens: "~300 T raw" },
    { name: "HTML extract", sub: "Trafilatura / Resiliparse", h: 78, tokens: "~120 T text" },
    { name: "Quality filter", sub: "Classifier + heuristics", h: 56, tokens: "~30 T" },
    { name: "Deduplication", sub: "MinHash, n-gram", h: 40, tokens: "~12 T" },
    { name: "Safety / PII", sub: "Filters + redaction", h: 36, tokens: "~10 T" },
    { name: "Training mix", sub: "Web · Code · Books · Synth", h: 50, tokens: "5–40 T" },
  ];

  const N = stages.length;
  const gap = 8;
  const innerLeft = 16;
  const innerRight = W - 16;
  const stageW = (innerRight - innerLeft - gap * (N - 1)) / N;

  const baselineY = 170;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Pretraining data pipeline: Common Crawl through extraction, filtering, deduplication, safety, and the final training mix."
      className="w-full max-w-[580px] text-foreground"
    >
      <defs>
        <marker
          id="dp-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Baseline */}
      <line
        x1={innerLeft}
        y1={baselineY}
        x2={innerRight}
        y2={baselineY}
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      {stages.map((s, i) => {
        const x = innerLeft + i * (stageW + gap);
        const isMix = i === N - 1;
        return (
          <g key={s.name}>
            {/* Stage card */}
            <rect
              x={x}
              y={20}
              width={stageW}
              height={42}
              rx={6}
              fill="var(--color-card)"
              stroke={isMix ? "var(--color-primary)" : "currentColor"}
              strokeOpacity={isMix ? 1 : 0.35}
              strokeWidth="1.5"
            />
            <text
              x={x + stageW / 2}
              y={36}
              textAnchor="middle"
              className="fill-current text-[10.5px] font-semibold"
            >
              {s.name}
            </text>
            <text
              x={x + stageW / 2}
              y={51}
              textAnchor="middle"
              className="fill-current text-[9px]"
              style={{ opacity: 0.6 }}
            >
              {s.sub}
            </text>

            {/* Yield bar */}
            <rect
              x={x + 4}
              y={baselineY - s.h}
              width={stageW - 8}
              height={s.h}
              rx={3}
              fill={
                isMix
                  ? "color-mix(in oklch, var(--color-primary) 28%, transparent)"
                  : "color-mix(in oklch, var(--color-foreground) 8%, transparent)"
              }
              stroke={isMix ? "var(--color-primary)" : "currentColor"}
              strokeOpacity={isMix ? 1 : 0.32}
              strokeWidth="1.2"
            />

            {/* Token-count label */}
            <text
              x={x + stageW / 2}
              y={baselineY + 14}
              textAnchor="middle"
              className="fill-current text-[10px] font-mono"
            >
              {s.tokens}
            </text>

            {/* Arrow to next stage */}
            {i < N - 1 && (
              <line
                x1={x + stageW + 1}
                y1={41}
                x2={x + stageW + gap - 1}
                y2={41}
                stroke="currentColor"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                markerEnd="url(#dp-arrow)"
              />
            )}
          </g>
        );
      })}

      {/* Axis caption */}
      <text
        x={innerLeft}
        y={H - 8}
        className="fill-current text-[10px]"
        style={{ opacity: 0.55 }}
      >
        Bar height ≈ surviving token volume (log-ish scale; numbers illustrative for a 2025-era recipe).
      </text>
    </svg>
  );
}
