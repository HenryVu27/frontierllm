/**
 * TransformerBlock — residual-stream view of one pre-norm transformer block.
 *
 * Vertical layout: the residual stream runs as a thick vertical channel on the
 * left; attention and MLP sub-blocks branch off it, do their work, and the
 * delta is added back via a small "+" node. Norms appear inside the residual
 * branches (pre-norm placement).
 *
 * Uses currentColor + CSS variables (var(--color-primary)) so it inherits
 * theme tokens cleanly in both light and dark mode.
 */
export default function TransformerBlock() {
  // Canvas
  const W = 520;
  const H = 360;

  // Residual stream column (left side)
  const streamX = 80;

  // Sub-block column (right side)
  const blockX = 280;
  const blockW = 200;

  // Vertical anchors for the four key nodes
  const yIn = 30;       // input from previous block
  const yAttnAdd = 145; // attention add-node
  const yMlpAdd = 285;  // mlp add-node
  const yOut = 340;     // output

  const arrow = "url(#tb-arrow)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Transformer block with pre-norm placement: residual stream on the left, attention and MLP sub-blocks branching off and re-adding into the stream."
      className="w-full max-w-[520px] text-foreground"
    >
      <defs>
        <marker
          id="tb-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Residual stream — thick translucent rail */}
      <line
        x1={streamX}
        y1={yIn}
        x2={streamX}
        y2={yOut}
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Centered hairline for the stream */}
      <line
        x1={streamX}
        y1={yIn}
        x2={streamX}
        y2={yOut}
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Stream label */}
      <text
        x={streamX - 14}
        y={(yIn + yOut) / 2}
        textAnchor="end"
        className="fill-current text-[11px] font-mono"
        style={{ opacity: 0.6 }}
        transform={`rotate(-90 ${streamX - 14} ${(yIn + yOut) / 2})`}
      >
        residual stream  x ∈ ℝᵈ
      </text>

      {/* Input from previous block */}
      <text
        x={streamX}
        y={yIn - 10}
        textAnchor="middle"
        className="fill-current text-[11px]"
        style={{ opacity: 0.7 }}
      >
        from block ℓ−1
      </text>

      {/* Output to next block */}
      <text
        x={streamX}
        y={yOut + 14}
        textAnchor="middle"
        className="fill-current text-[11px]"
        style={{ opacity: 0.7 }}
      >
        to block ℓ+1
      </text>

      {/* ── Attention sub-block ─────────────────────────────────────────── */}
      {/* tap-off line */}
      <line
        x1={streamX}
        y1={75}
        x2={blockX}
        y2={75}
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={arrow}
      />
      {/* return line into add-node */}
      <line
        x1={blockX}
        y1={yAttnAdd}
        x2={streamX + 8}
        y2={yAttnAdd}
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={arrow}
      />

      {/* RMSNorm pill */}
      <g>
        <rect
          x={blockX}
          y={62}
          width={70}
          height={26}
          rx={6}
          fill="var(--color-card)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x={blockX + 35}
          y={79}
          textAnchor="middle"
          className="fill-current text-[11px] font-medium"
        >
          RMSNorm
        </text>
      </g>

      {/* Attention block */}
      <g>
        <rect
          x={blockX + 80}
          y={55}
          width={blockW - 80}
          height={80}
          rx={8}
          fill="color-mix(in oklch, var(--color-primary) 8%, transparent)"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        />
        <text
          x={blockX + 80 + (blockW - 80) / 2}
          y={82}
          textAnchor="middle"
          className="fill-current text-[12px] font-semibold"
        >
          Self-Attention
        </text>
        <text
          x={blockX + 80 + (blockW - 80) / 2}
          y={102}
          textAnchor="middle"
          className="fill-current text-[10px] font-mono"
          style={{ opacity: 0.7 }}
        >
          softmax(QKᵀ/√dₖ) V
        </text>
        <text
          x={blockX + 80 + (blockW - 80) / 2}
          y={120}
          textAnchor="middle"
          className="fill-current text-[10px]"
          style={{ opacity: 0.55 }}
        >
          (MHA / GQA / MLA)
        </text>
      </g>

      {/* Add node — attention */}
      <g>
        <circle
          cx={streamX}
          cy={yAttnAdd}
          r={9}
          fill="var(--color-background)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x={streamX}
          y={yAttnAdd + 3.5}
          textAnchor="middle"
          className="fill-current text-[12px] font-semibold"
        >
          +
        </text>
      </g>

      {/* ── MLP sub-block ──────────────────────────────────────────────── */}
      <line
        x1={streamX}
        y1={215}
        x2={blockX}
        y2={215}
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={arrow}
      />
      <line
        x1={blockX}
        y1={yMlpAdd}
        x2={streamX + 8}
        y2={yMlpAdd}
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={arrow}
      />

      <g>
        <rect
          x={blockX}
          y={202}
          width={70}
          height={26}
          rx={6}
          fill="var(--color-card)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x={blockX + 35}
          y={219}
          textAnchor="middle"
          className="fill-current text-[11px] font-medium"
        >
          RMSNorm
        </text>
      </g>

      <g>
        <rect
          x={blockX + 80}
          y={195}
          width={blockW - 80}
          height={80}
          rx={8}
          fill="color-mix(in oklch, var(--color-primary) 8%, transparent)"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        />
        <text
          x={blockX + 80 + (blockW - 80) / 2}
          y={222}
          textAnchor="middle"
          className="fill-current text-[12px] font-semibold"
        >
          MLP / SwiGLU
        </text>
        <text
          x={blockX + 80 + (blockW - 80) / 2}
          y={242}
          textAnchor="middle"
          className="fill-current text-[10px] font-mono"
          style={{ opacity: 0.7 }}
        >
          W₂ (σ(W₁x) ⊙ W₃x)
        </text>
        <text
          x={blockX + 80 + (blockW - 80) / 2}
          y={260}
          textAnchor="middle"
          className="fill-current text-[10px]"
          style={{ opacity: 0.55 }}
        >
          d_ff = 8d/3
        </text>
      </g>

      {/* Add node — MLP */}
      <g>
        <circle
          cx={streamX}
          cy={yMlpAdd}
          r={9}
          fill="var(--color-background)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x={streamX}
          y={yMlpAdd + 3.5}
          textAnchor="middle"
          className="fill-current text-[12px] font-semibold"
        >
          +
        </text>
      </g>

      {/* Δ annotations */}
      <text
        x={(streamX + blockX) / 2}
        y={yAttnAdd - 6}
        textAnchor="middle"
        className="fill-current text-[10px] font-mono"
        style={{ opacity: 0.7 }}
      >
        Δ_attn
      </text>
      <text
        x={(streamX + blockX) / 2}
        y={yMlpAdd - 6}
        textAnchor="middle"
        className="fill-current text-[10px] font-mono"
        style={{ opacity: 0.7 }}
      >
        Δ_mlp
      </text>
    </svg>
  );
}
