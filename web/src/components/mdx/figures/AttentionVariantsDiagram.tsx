/**
 * AttentionVariantsDiagram — schematic of which Q-heads share K/V projections.
 *
 * Four panels in a 2×2 grid (MHA, GQA, MQA, MLA). Each panel shows 8 Q-head
 * circles on the top row connected by short links to their K/V heads on the
 * bottom row. The connection density is what distinguishes the four variants.
 *
 * MLA is drawn differently: K/V heads collapse into a single low-rank latent
 * "c" box, plus a separate decoupled RoPE-key pill — matching the chapter's
 * treatment.
 */
export default function AttentionVariantsDiagram() {
  const PANEL_W = 240;
  const PANEL_H = 180;
  const W = PANEL_W * 2 + 30;
  const H = PANEL_H * 2 + 30;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Attention variant weight-sharing patterns: MHA, GQA, MQA, MLA"
      className="w-full max-w-[510px] text-foreground"
    >
      <Panel x={0} y={0} title="MHA" subtitle="H Q-heads · H KV-heads" variant="mha" />
      <Panel x={PANEL_W + 30} y={0} title="GQA" subtitle="H Q-heads · G KV-heads" variant="gqa" />
      <Panel x={0} y={PANEL_H + 30} title="MQA" subtitle="H Q-heads · 1 KV-head" variant="mqa" />
      <Panel
        x={PANEL_W + 30}
        y={PANEL_H + 30}
        title="MLA"
        subtitle="Latent c + decoupled RoPE"
        variant="mla"
      />
    </svg>
  );
}

type Variant = "mha" | "gqa" | "mqa" | "mla";

interface PanelProps {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  variant: Variant;
}

function Panel({ x, y, title, subtitle, variant }: PanelProps) {
  const W = 240;
  const H = 180;

  const Q_COUNT = 8;
  const innerLeft = 14;
  const innerRight = W - 14;
  const qY = 70;
  const kvY = 130;
  const qR = 6;
  const kvR = 7;

  const qXs = Array.from(
    { length: Q_COUNT },
    (_, i) =>
      innerLeft + ((innerRight - innerLeft) / (Q_COUNT - 1)) * i,
  );

  // KV head positions per variant
  let kvXs: number[];
  let qToKv: number[]; // for each q index, kv index it connects to
  if (variant === "mha") {
    kvXs = qXs.slice();
    qToKv = qXs.map((_, i) => i);
  } else if (variant === "gqa") {
    const G = 2;
    kvXs = Array.from(
      { length: G },
      (_, g) =>
        innerLeft + ((innerRight - innerLeft) / (G - 1)) * g,
    );
    qToKv = qXs.map((_, i) => Math.floor(i / (Q_COUNT / G)));
  } else if (variant === "mqa") {
    kvXs = [(innerLeft + innerRight) / 2];
    qToKv = qXs.map(() => 0);
  } else {
    // MLA — single latent
    kvXs = [(innerLeft + innerRight) / 2];
    qToKv = qXs.map(() => 0);
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Panel chrome */}
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        rx={8}
        fill="var(--color-card)"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />

      {/* Title row */}
      <text
        x={12}
        y={20}
        className="fill-current text-[12px] font-semibold"
      >
        {title}
      </text>
      <text
        x={12}
        y={36}
        className="fill-current text-[10px]"
        style={{ opacity: 0.6 }}
      >
        {subtitle}
      </text>

      {/* Q row label */}
      <text
        x={4}
        y={qY + 3}
        className="fill-current text-[9px] font-mono"
        style={{ opacity: 0.55 }}
      >
        Q
      </text>
      {/* KV row label */}
      <text
        x={4}
        y={kvY + 3}
        className="fill-current text-[9px] font-mono"
        style={{ opacity: 0.55 }}
      >
        {variant === "mla" ? "c" : "K,V"}
      </text>

      {/* Connection lines */}
      {qXs.map((qx, i) => {
        const kvIdx = qToKv[i] ?? 0;
        const kvx = kvXs[kvIdx] ?? 0;
        return (
          <line
            key={`l-${i}`}
            x1={qx}
            y1={qY + qR}
            x2={kvx}
            y2={kvY - kvR}
            stroke="currentColor"
            strokeOpacity="0.32"
            strokeWidth="1"
          />
        );
      })}

      {/* Q head circles */}
      {qXs.map((qx, i) => (
        <circle
          key={`q-${i}`}
          cx={qx}
          cy={qY}
          r={qR}
          fill="var(--color-background)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}

      {/* KV nodes (rectangles for KV; latent for MLA) */}
      {variant === "mla" ? (
        <>
          {/* Latent c box */}
          <rect
            x={(kvXs[0] ?? 0) - 36}
            y={kvY - 10}
            width={72}
            height={20}
            rx={4}
            fill="color-mix(in oklch, var(--color-primary) 14%, transparent)"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
          />
          <text
            x={kvXs[0]}
            y={kvY + 4}
            textAnchor="middle"
            className="fill-current text-[10px] font-mono font-semibold"
          >
            c (d_c ≪ 2nₕdₕ)
          </text>
          {/* Decoupled RoPE pill */}
          <rect
            x={innerLeft}
            y={H - 24}
            width={W - 2 * innerLeft}
            height={16}
            rx={3}
            fill="color-mix(in oklch, var(--color-accent) 50%, transparent)"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          <text
            x={W / 2}
            y={H - 13}
            textAnchor="middle"
            className="fill-current text-[9px] font-mono"
          >
            + decoupled RoPE-key kᴿ (small)
          </text>
        </>
      ) : (
        kvXs.map((kvx, i) => (
          <rect
            key={`kv-${i}`}
            x={kvx - kvR}
            y={kvY - kvR}
            width={kvR * 2}
            height={kvR * 2}
            rx={2}
            fill="color-mix(in oklch, var(--color-primary) 14%, transparent)"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
          />
        ))
      )}
    </g>
  );
}
