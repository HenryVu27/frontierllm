/**
 * TensorParallelMatmul — column-parallel vs row-parallel linear (Megatron style).
 *
 * Two side-by-side panels:
 *  • Column-parallel: weight W is split *along its output dimension*. Each
 *    rank computes a slice of the output, no comm during forward; an
 *    all-gather (or no-op if next layer is row-parallel) follows.
 *  • Row-parallel:    weight W is split *along its input dimension*. Each
 *    rank needs only its slice of the input but produces a partial sum;
 *    an all-reduce at the end combines partial sums into the full output.
 *
 * The standard Megatron MLP pairs them: ColumnParallel→GeLU→RowParallel,
 * which fuses to exactly one all-reduce per block.
 */
export default function TensorParallelMatmul() {
  const W = 580;
  const H = 280;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Tensor parallel: column-parallel vs row-parallel linear layer sharding"
      className="w-full max-w-[580px] text-foreground"
    >
      <Panel x={0} y={0} variant="column" />
      <Panel x={300} y={0} variant="row" />

      {/* Composition hint */}
      <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-current text-[10px]" style={{ opacity: 0.65 }}>
        Megatron MLP composition: ColumnParallel → GeLU → RowParallel ⇒ 1 all-reduce / block
      </text>
    </svg>
  );
}

function Panel({ x, y, variant }: { x: number; y: number; variant: "column" | "row" }) {
  const PW = 280;
  const PH = 250;
  const isCol = variant === "column";

  // Geometry for matrix block
  const matX = 40;
  const matY = 78;
  const matW = 200;
  const matH = 80;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={PW} height={PH} rx={8} fill="var(--color-card)" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />

      {/* title */}
      <text x={14} y={22} className="fill-current text-[12px] font-semibold">
        {isCol ? "Column-parallel  (split outputs)" : "Row-parallel  (split inputs)"}
      </text>
      <text x={14} y={38} className="fill-current font-mono text-[10px]" style={{ opacity: 0.6 }}>
        {isCol ? "Y = X · [W₁ | W₂]   on each rank: Yᵢ = X · Wᵢ" : "Y = [X₁  X₂] · [W₁; W₂]   on each rank: partial = Xᵢ·Wᵢ"}
      </text>

      {/* X block */}
      <g>
        <rect x={matX - 28} y={matY + (isCol ? 0 : matH / 2) - 8} width={24} height={isCol ? matH : matH / 2} rx={3} fill="color-mix(in oklch, var(--color-foreground) 8%, transparent)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
        <text x={matX - 16} y={matY + matH / 2 + 4} textAnchor="middle" className="fill-current font-mono text-[10px]">X</text>
      </g>

      {/* W block split */}
      {isCol ? (
        <>
          <rect x={matX} y={matY} width={matW / 2 - 1} height={matH} rx={3} fill="color-mix(in oklch, var(--color-primary) 18%, transparent)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x={matX + matW / 2 + 1} y={matY} width={matW / 2 - 1} height={matH} rx={3} fill="color-mix(in oklch, var(--color-warning) 22%, transparent)" stroke="var(--color-warning)" strokeWidth="1.5" />
          <text x={matX + matW / 4} y={matY + matH / 2 + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">W₁ · rank 0</text>
          <text x={matX + (3 * matW) / 4} y={matY + matH / 2 + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">W₂ · rank 1</text>
        </>
      ) : (
        <>
          <rect x={matX} y={matY} width={matW} height={matH / 2 - 1} rx={3} fill="color-mix(in oklch, var(--color-primary) 18%, transparent)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x={matX} y={matY + matH / 2 + 1} width={matW} height={matH / 2 - 1} rx={3} fill="color-mix(in oklch, var(--color-warning) 22%, transparent)" stroke="var(--color-warning)" strokeWidth="1.5" />
          <text x={matX + matW / 2} y={matY + matH / 4 + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">W₁ · rank 0</text>
          <text x={matX + matW / 2} y={matY + (3 * matH) / 4 + 4} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">W₂ · rank 1</text>
        </>
      )}

      {/* Y / comm block */}
      <g transform={`translate(0, ${matY + matH + 28})`}>
        {isCol ? (
          <>
            <rect x={matX} y={0} width={matW / 2 - 1} height={22} rx={3} fill="color-mix(in oklch, var(--color-primary) 18%, transparent)" stroke="var(--color-primary)" strokeWidth="1.5" />
            <rect x={matX + matW / 2 + 1} y={0} width={matW / 2 - 1} height={22} rx={3} fill="color-mix(in oklch, var(--color-warning) 22%, transparent)" stroke="var(--color-warning)" strokeWidth="1.5" />
            <text x={matX + matW / 4} y={14} textAnchor="middle" className="fill-current font-mono text-[9px]">Y₁ slice</text>
            <text x={matX + (3 * matW) / 4} y={14} textAnchor="middle" className="fill-current font-mono text-[9px]">Y₂ slice</text>
            <text x={matX + matW / 2} y={48} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold" style={{ fill: "var(--color-success)" }}>
              no comm (or all-gather if next layer is dense)
            </text>
          </>
        ) : (
          <>
            <rect x={matX} y={0} width={matW} height={22} rx={3} fill="color-mix(in oklch, var(--color-accent) 35%, transparent)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
            <text x={matX + matW / 2} y={14} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold">all-reduce(partial₀ + partial₁) = Y</text>
            <text x={matX + matW / 2} y={48} textAnchor="middle" className="fill-current font-mono text-[10px] font-semibold" style={{ fill: "var(--color-warning)" }}>
              1 all-reduce per layer
            </text>
          </>
        )}
      </g>
    </g>
  );
}
