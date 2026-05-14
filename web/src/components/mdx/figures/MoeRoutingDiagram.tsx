/**
 * MoeRoutingDiagram — token-choice top-k routing with capacity factor.
 *
 * Layout: a row of tokens at top, routed via a small "router" node, into a row
 * of expert columns at the bottom. Each token sends an arrow to its top-2
 * experts (illustrative). One expert is shaded as "at capacity" with a
 * dropped-token indicator. A small legend annotates capacity factor.
 */
export default function MoeRoutingDiagram() {
  const W = 540;
  const H = 320;

  // Layout anchors
  const tokenY = 36;
  const routerY = 100;
  const expertY = 220;
  const expertH = 56;

  const tokenXs = [60, 130, 200, 270, 340, 410, 480];
  const expertXs = [80, 180, 280, 380, 480];

  // top-2 routing pattern (deterministic for illustration)
  // each token -> [primary, secondary]
  const routing: [number, number][] = [
    [1, 3],
    [0, 1],
    [1, 4],
    [2, 4],
    [1, 3],
    [0, 2],
    [3, 4], // this last one drops on expert 1 because at capacity
  ];

  // Expert 1 is shaded as "at capacity"
  const overflowedExpert = 1;
  const dropToken = 6; // token index that gets dropped at expert 1

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Top-k MoE routing: tokens routed to top-2 experts via a router; one expert is at capacity and overflow tokens are dropped."
      className="w-full max-w-[540px] text-foreground"
    >
      <defs>
        <marker
          id="moe-arrow"
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

      {/* Token row label */}
      <text
        x={12}
        y={tokenY + 4}
        className="fill-current text-[10px] font-mono"
        style={{ opacity: 0.55 }}
      >
        tokens
      </text>

      {/* Tokens */}
      {tokenXs.map((x, i) => (
        <g key={`t-${i}`}>
          <rect
            x={x - 12}
            y={tokenY - 10}
            width={24}
            height={20}
            rx={3}
            fill="var(--color-card)"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <text
            x={x}
            y={tokenY + 4}
            textAnchor="middle"
            className="fill-current text-[10px] font-mono"
          >
            t{i + 1}
          </text>
        </g>
      ))}

      {/* Router node */}
      <g>
        <rect
          x={W / 2 - 60}
          y={routerY - 16}
          width={120}
          height={32}
          rx={16}
          fill="color-mix(in oklch, var(--color-primary) 10%, transparent)"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        />
        <text
          x={W / 2}
          y={routerY + 4}
          textAnchor="middle"
          className="fill-current text-[11px] font-semibold"
        >
          Router (softmax · top-k)
        </text>
      </g>

      {/* Lines from tokens into router fan */}
      {tokenXs.map((x, i) => (
        <line
          key={`t2r-${i}`}
          x1={x}
          y1={tokenY + 11}
          x2={W / 2}
          y2={routerY - 18}
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="1"
        />
      ))}

      {/* Lines from router out to experts (top-k) */}
      {routing.map(([p, s], i) => {
        const tokenX = tokenXs[i];
        // primary line — solid
        return (
          <g key={`out-${i}`}>
            <line
              x1={W / 2 - 24 + ((i - 3) * 6)}
              y1={routerY + 18}
              x2={expertXs[p]}
              y2={expertY - 4}
              stroke="currentColor"
              strokeOpacity={i === dropToken && p === overflowedExpert ? 0.45 : 0.55}
              strokeWidth="1.2"
              strokeDasharray={i === dropToken && p === overflowedExpert ? "3 3" : undefined}
              markerEnd="url(#moe-arrow)"
            />
            <line
              x1={W / 2 - 24 + ((i - 3) * 6)}
              y1={routerY + 18}
              x2={expertXs[s]}
              y2={expertY - 4}
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="1"
              markerEnd="url(#moe-arrow)"
            />
            {/* tiny dot at fan-out origin so the geometry reads clearly */}
            <circle
              cx={W / 2 - 24 + ((i - 3) * 6)}
              cy={routerY + 18}
              r={1.5}
              fill="currentColor"
              opacity="0.6"
            />
            {/* invisible reference to token so eslint is happy */}
            <title>{`token at x=${tokenX}`}</title>
          </g>
        );
      })}

      {/* Experts */}
      {expertXs.map((x, i) => {
        const isOverflow = i === overflowedExpert;
        return (
          <g key={`e-${i}`}>
            <rect
              x={x - 38}
              y={expertY}
              width={76}
              height={expertH}
              rx={6}
              fill={
                isOverflow
                  ? "color-mix(in oklch, var(--color-warning) 24%, transparent)"
                  : "var(--color-card)"
              }
              stroke={isOverflow ? "var(--color-warning)" : "currentColor"}
              strokeOpacity={isOverflow ? 1 : 0.45}
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={expertY + 22}
              textAnchor="middle"
              className="fill-current text-[11px] font-semibold"
            >
              Expert {i + 1}
            </text>
            <text
              x={x}
              y={expertY + 38}
              textAnchor="middle"
              className="fill-current text-[9px] font-mono"
              style={{ opacity: 0.7 }}
            >
              {isOverflow ? "at capacity" : "MLP / SwiGLU"}
            </text>
          </g>
        );
      })}

      {/* Capacity-factor caption */}
      <g transform={`translate(0, ${H - 18})`}>
        <line
          x1={20}
          y1={0}
          x2={36}
          y2={0}
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        <text x={42} y={3.5} className="fill-current text-[10px]" style={{ opacity: 0.7 }}>
          dropped (overflow at capacity C = ⌈k·T/E⌉ · cf)
        </text>

        <rect
          x={W - 200}
          y={-6}
          width={12}
          height={12}
          rx={2}
          fill="color-mix(in oklch, var(--color-warning) 24%, transparent)"
          stroke="var(--color-warning)"
          strokeWidth="1.2"
        />
        <text x={W - 184} y={3.5} className="fill-current text-[10px]" style={{ opacity: 0.7 }}>
          expert above capacity
        </text>
      </g>
    </svg>
  );
}
