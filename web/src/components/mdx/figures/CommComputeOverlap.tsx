import { useState } from "react";

/**
 * CommComputeOverlap — three timing diagrams that show the value of
 * overlapping collectives with compute.
 *
 * Modes:
 *  • Serial      — fwd / bwd then all-reduce; comm sits on critical path
 *  • Overlapped  — bucketed all-reduce starts as soon as a bucket's grads
 *                   are ready, runs concurrently with remaining bwd compute
 *  • Bucket-tune — slider for bucket size; small buckets → more overlap but
 *                   more startup overhead, large buckets → less overlap
 *
 * The figure is illustrative; it does not model NCCL latency precisely but
 * captures the right qualitative story.
 */
type Mode = "serial" | "overlapped";

export default function CommComputeOverlap() {
  const [mode, setMode] = useState<Mode>("overlapped");
  const [buckets, setBuckets] = useState(4);

  const W = 580;
  const H = 200;
  const padL = 80;
  const padR = 16;
  const padT = 30;
  const padB = 36;

  // Compute duration units (relative)
  const FWD = 50;
  const BWD = 70;
  const PER_BUCKET_COMM = 18;

  // For serial: total = FWD + BWD + all-reduce(monolithic)
  // For overlapped: total = FWD + max(BWD, BWD/buckets * (buckets-1) + comm last bucket)
  //   simplification: bwd runs in parallel with comm of completed buckets;
  //   total = FWD + BWD + PER_BUCKET_COMM (last bucket cannot be hidden)
  const serialTotal = FWD + BWD + buckets * PER_BUCKET_COMM;
  const overlappedTotal = FWD + BWD + PER_BUCKET_COMM;
  const speedup = serialTotal / overlappedTotal;

  const total = Math.max(serialTotal, overlappedTotal) + 20;
  const innerW = W - padL - padR;
  const sx = (t: number) => padL + (t / total) * innerW;

  return (
    <div className="w-full max-w-[600px] flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setMode("serial")}
          className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (mode === "serial" ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
          aria-pressed={mode === "serial"}
        >
          serial
        </button>
        <button
          type="button"
          onClick={() => setMode("overlapped")}
          className={"inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 " + (mode === "overlapped" ? "border-foreground/40 bg-subtle/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:bg-subtle/30")}
          aria-pressed={mode === "overlapped"}
        >
          bucketed overlap
        </button>
        <div className="ml-auto text-[10.5px] font-mono text-muted-foreground tabular-nums">
          {mode === "overlapped" ? <>speedup vs serial: <span className="text-foreground">{speedup.toFixed(2)}×</span></> : <>total time: <span className="text-foreground">{serialTotal}</span> units</>}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Communication-computation overlap timeline" className="text-foreground">
        {/* row labels */}
        <text x={padL - 8} y={padT + 22} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>compute</text>
        <text x={padL - 8} y={padT + 72} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.7 }}>comm</text>

        {/* time axis */}
        <line x1={padL} y1={H - padB + 2} x2={W - padR} y2={H - padB + 2} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <text x={W - padR} y={H - padB + 16} textAnchor="end" className="fill-current font-mono text-[10px]" style={{ opacity: 0.55 }}>time →</text>

        {/* === Compute row === */}
        <rect x={sx(0)} y={padT + 8} width={sx(FWD) - sx(0)} height={26} rx={3} fill="color-mix(in oklch, var(--color-primary) 22%, transparent)" stroke="var(--color-primary)" strokeWidth="1.2" />
        <text x={sx(FWD / 2)} y={padT + 25} textAnchor="middle" className="fill-current font-mono text-[9.5px] font-semibold">forward</text>

        <rect x={sx(FWD)} y={padT + 8} width={sx(FWD + BWD) - sx(FWD)} height={26} rx={3} fill="color-mix(in oklch, var(--color-warning) 26%, transparent)" stroke="var(--color-warning)" strokeWidth="1.2" />
        <text x={sx(FWD + BWD / 2)} y={padT + 25} textAnchor="middle" className="fill-current font-mono text-[9.5px] font-semibold">backward</text>

        {/* === Comm row === */}
        {mode === "serial" ? (
          <>
            <rect x={sx(FWD + BWD)} y={padT + 58} width={sx(FWD + BWD + buckets * PER_BUCKET_COMM) - sx(FWD + BWD)} height={26} rx={3} fill="color-mix(in oklch, var(--color-success) 24%, transparent)" stroke="var(--color-success)" strokeWidth="1.2" />
            <text x={sx(FWD + BWD + (buckets * PER_BUCKET_COMM) / 2)} y={padT + 75} textAnchor="middle" className="fill-current font-mono text-[9.5px] font-semibold">all-reduce (whole grad)</text>
          </>
        ) : (
          // Each bucket of bwd grad becomes available at BWD * (i+1) / buckets after fwd
          Array.from({ length: buckets }).map((_, i) => {
            const ready = FWD + (BWD * (i + 1)) / buckets;
            const start = ready;
            const end = start + PER_BUCKET_COMM;
            return (
              <g key={i}>
                <rect x={sx(start)} y={padT + 58} width={sx(end) - sx(start)} height={26} rx={3} fill="color-mix(in oklch, var(--color-success) 24%, transparent)" stroke="var(--color-success)" strokeWidth="1.2" />
                <text x={(sx(start) + sx(end)) / 2} y={padT + 75} textAnchor="middle" className="fill-current font-mono text-[8.5px]">b{i + 1}</text>
              </g>
            );
          })
        )}

        {/* dotted critical-path indicator */}
        <line x1={sx(mode === "serial" ? serialTotal : overlappedTotal)} y1={padT - 4} x2={sx(mode === "serial" ? serialTotal : overlappedTotal)} y2={H - padB + 4} stroke="var(--color-warning)" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={sx(mode === "serial" ? serialTotal : overlappedTotal) + 6} y={padT + 2} className="fill-current font-mono text-[9px]" style={{ fill: "var(--color-warning)" }}>step boundary</text>
      </svg>

      {mode === "overlapped" && (
        <div className="px-1">
          <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
            <span>gradient buckets</span>
            <span className="tabular-nums text-foreground">{buckets}</span>
          </label>
          <input type="range" min={1} max={8} step={1} value={buckets} onChange={(e) => setBuckets(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Number of gradient buckets" />
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            More buckets → finer-grain overlap but more startup overhead per all-reduce. Tail bucket cannot be hidden.
          </p>
        </div>
      )}
    </div>
  );
}
