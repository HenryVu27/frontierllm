/**
 * RlhfPpoLoop — the four-model PPO dataflow that drives canonical RLHF.
 *
 * Four boxes:
 *  • Policy π_θ        (trained)         — produces samples a~π_θ(·|s)
 *  • Reference π_ref   (frozen)          — for KL penalty; usually = SFT init
 *  • Reward r_φ        (frozen, trained
 *                       separately on
 *                       preference data) — scores (s,a)
 *  • Value V_ψ         (trained)         — baseline for advantage
 *
 * Arrows show the data path in one PPO iteration:
 *   1. Policy samples a rollout {s_t, a_t}
 *   2. Reward model scores each step;  reference model gives logπ_ref
 *      to form the KL penalty;  value model gives V(s_t)
 *   3. Reward + KL + value form per-token advantage Â
 *   4. PPO clip-objective updates π_θ and V_ψ
 */
export default function RlhfPpoLoop() {
  const W = 620;
  const H = 360;

  // Box positions
  const policyX = 260, policyY = 30;
  const refX = 30, refY = 30;
  const rewardX = 30, rewardY = 230;
  const valueX = 490, valueY = 30;
  const advX = 260, advY = 230;
  const updX = 260, updY = 320;

  const boxW = 110, boxH = 60;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="RLHF PPO four-model dataflow" className="w-full max-w-[640px] text-foreground">
      <defs>
        <marker id="ppo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      <Box x={policyX} y={policyY} w={boxW} h={boxH} title="Policy" subtitle="π_θ  (trained)" tone="primary" />
      <Box x={refX} y={refY} w={boxW} h={boxH} title="Reference" subtitle="π_ref  (frozen)" tone="muted" />
      <Box x={valueX} y={valueY} w={boxW} h={boxH} title="Value" subtitle="V_ψ  (trained)" tone="primary" />
      <Box x={rewardX} y={rewardY} w={boxW} h={boxH} title="Reward" subtitle="r_φ  (frozen)" tone="muted" />

      {/* Advantage + KL combiner */}
      <g>
        <rect x={advX - 20} y={advY} width={boxW + 40} height={boxH} rx={8} fill="color-mix(in oklch, var(--color-warning) 16%, transparent)" stroke="var(--color-warning)" strokeWidth="1.5" />
        <text x={advX + boxW / 2} y={advY + 24} textAnchor="middle" className="fill-current text-[12px] font-semibold">Advantage + KL</text>
        <text x={advX + boxW / 2} y={advY + 44} textAnchor="middle" className="fill-current font-mono text-[10px]" style={{ opacity: 0.75 }}>
          Âₜ = Σ γᵏδₜ₊ₖ ; reward − β · KL
        </text>
      </g>

      {/* PPO update */}
      <g>
        <rect x={updX} y={updY} width={boxW} height={32} rx={6} fill="color-mix(in oklch, var(--color-primary) 28%, transparent)" stroke="var(--color-primary)" strokeWidth="1.5" />
        <text x={updX + boxW / 2} y={updY + 20} textAnchor="middle" className="fill-current text-[11px] font-semibold">PPO clip update</text>
      </g>

      {/* Arrows */}
      {/* policy → reference (logπ_θ for KL) */}
      <Arrow x1={policyX} y1={policyY + boxH / 2} x2={refX + boxW} y2={refY + boxH / 2} label="logπ_θ ↔ logπ_ref" />
      {/* policy → reward (rollout) */}
      <Arrow x1={policyX + boxW / 2} y1={policyY + boxH} x2={rewardX + boxW / 2 + 20} y2={rewardY} label="(s, a) rollout" />
      {/* policy → value */}
      <Arrow x1={policyX + boxW} y1={policyY + boxH / 2} x2={valueX} y2={valueY + boxH / 2} label="s_t" />
      {/* reward → advantage */}
      <Arrow x1={rewardX + boxW} y1={rewardY + boxH / 2} x2={advX - 20} y2={advY + boxH / 2 - 8} label="r_t" />
      {/* value → advantage */}
      <Arrow x1={valueX} y1={valueY + boxH} x2={advX + boxW + 20} y2={advY + boxH / 2 - 8} label="V(s_t)" />
      {/* reference → advantage (KL term) */}
      <Arrow x1={refX + boxW / 2} y1={refY + boxH} x2={advX - 18} y2={advY + 12} label="β·KL" />
      {/* advantage → ppo update */}
      <Arrow x1={advX + boxW / 2} y1={advY + boxH} x2={updX + boxW / 2} y2={updY} label="Â" />
      {/* ppo update → policy (closes loop) */}
      <path
        d={`M ${updX + boxW} ${updY + 16} C ${updX + boxW + 90} ${updY + 16}, ${policyX + boxW + 90} ${policyY + boxH / 2}, ${policyX + boxW + 4} ${policyY + boxH / 2}`}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#ppo-arrow)"
      />
      <text x={updX + boxW + 70} y={updY + 4} className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-primary)" }}>θ ← θ + Δθ</text>
    </svg>
  );
}

function Box({ x, y, w, h, title, subtitle, tone }: { x: number; y: number; w: number; h: number; title: string; subtitle: string; tone: "primary" | "muted" }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={tone === "primary" ? "color-mix(in oklch, var(--color-primary) 12%, transparent)" : "var(--color-card)"}
        stroke={tone === "primary" ? "var(--color-primary)" : "currentColor"}
        strokeOpacity={tone === "primary" ? 1 : 0.35}
        strokeWidth="1.5"
      />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" className="fill-current text-[12px] font-semibold">{title}</text>
      <text x={x + w / 2} y={y + 42} textAnchor="middle" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>{subtitle}</text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  // Mid-point for label, with slight offset perpendicular to line
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.3" markerEnd="url(#ppo-arrow)" />
      <text x={mx + 4} y={my - 4} className="fill-current font-mono text-[9px]" style={{ opacity: 0.75 }}>{label}</text>
    </g>
  );
}
