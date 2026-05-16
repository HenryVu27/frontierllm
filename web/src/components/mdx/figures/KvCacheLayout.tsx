import { useMemo, useState } from "react";

/**
 * KvCacheLayout — contiguous KV cache vs PagedAttention block-table layout.
 *
 * Top panel: contiguous reservation. Each request reserves a full max_seq_len
 * slab whether it uses it or not. Wasted memory shows as light-grey trailing
 * cells. Internal fragmentation (= sum of unused cells / reserved cells)
 * displayed as a percentage.
 *
 * Bottom panel: PagedAttention. The same requests are partitioned into
 * fixed-size blocks (e.g. 16 tokens) from a shared block pool. Each request
 * holds a block-table pointing at its blocks. Blocks are allocated on demand,
 * so memory is amortized across requests — only the last block of a request
 * is partially-filled.
 *
 * Slider changes block size; you can see fragmentation rise as block size
 * grows (more last-block waste) and fall as block size shrinks (less waste
 * but more pointer overhead).
 */
export default function KvCacheLayout() {
  const [blockSize, setBlockSize] = useState(16);

  // Illustrative request set. Lengths in tokens; max_seq_len = 256 for the slab view.
  const requests = useMemo(
    () => [
      { id: 0, len: 142, color: "var(--color-primary)" },
      { id: 1, len: 38, color: "var(--color-warning)" },
      { id: 2, len: 211, color: "var(--color-success)" },
      { id: 3, len: 73, color: "color-mix(in oklch, var(--color-foreground) 55%, transparent)" },
    ],
    [],
  );
  const maxSeqLen = 256;

  // Contiguous: each request reserves maxSeqLen
  const contigReserved = requests.length * maxSeqLen;
  const contigUsed = requests.reduce((s, r) => s + r.len, 0);
  const contigFrag = 1 - contigUsed / contigReserved;

  // PagedAttention: ceil(len / blockSize) * blockSize per request
  const pagedReserved = requests.reduce(
    (s, r) => s + Math.ceil(r.len / blockSize) * blockSize,
    0,
  );
  const pagedFrag = 1 - contigUsed / pagedReserved;

  // === Geometry ===
  const W = 600;
  const H = 360;
  const padX = 20;
  const slabW = W - 2 * padX;

  // For contiguous view: 4 horizontal slabs of width slabW; cell width = slabW / maxSeqLen
  const contigCellW = slabW / maxSeqLen;
  const contigRowH = 18;
  const contigY = 32;

  // For paged view: render the same requests as block-tables in a grid
  const pagedY = 200;
  const blocksPerRow = 24;
  const blockPxW = (slabW - 2) / blocksPerRow;
  const blockPxH = 14;

  return (
    <div className="w-full max-w-[620px] flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="KV cache layout: contiguous reservation vs PagedAttention block table" className="text-foreground">
        {/* ── Contiguous ── */}
        <text x={padX} y={20} className="fill-current font-mono text-[11px] uppercase tracking-wider" style={{ opacity: 0.6 }}>
          contiguous reservation  ·  each request books max_seq_len = {maxSeqLen}
        </text>
        {requests.map((r, i) => {
          const y = contigY + i * (contigRowH + 4);
          const usedW = r.len * contigCellW;
          return (
            <g key={r.id}>
              <rect x={padX} y={y} width={slabW} height={contigRowH} rx={2} fill="color-mix(in oklch, var(--color-foreground) 4%, transparent)" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
              <rect x={padX} y={y} width={usedW} height={contigRowH} rx={2} fill={`color-mix(in oklch, ${r.color} 28%, transparent)`} stroke={r.color} strokeWidth="1" />
              <text x={padX + slabW + 6} y={y + 13} className="fill-current font-mono text-[9px]" style={{ opacity: 0.7 }}>
                req {r.id}: {r.len}/{maxSeqLen}
              </text>
            </g>
          );
        })}
        <text x={padX} y={contigY + requests.length * (contigRowH + 4) + 16} className="fill-current font-mono text-[10px] font-semibold" style={{ fill: "var(--color-warning)" }}>
          fragmentation = {(contigFrag * 100).toFixed(1)}%  (wasted cells / reserved cells)
        </text>

        {/* divider */}
        <line x1={padX} y1={pagedY - 18} x2={W - padX} y2={pagedY - 18} stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

        {/* ── PagedAttention ── */}
        <text x={padX} y={pagedY - 4} className="fill-current font-mono text-[11px] uppercase tracking-wider" style={{ opacity: 0.6 }}>
          paged attention  ·  block size = {blockSize} tokens · shared block pool
        </text>

        {/* Shared block pool, drawn as a grid. Color each block by the request that owns it. */}
        {(() => {
          // Allocate blocks round-robin to requests, in request order, taking each
          // request's required block count.
          const blocks: { reqId: number | null; color: string; usedFrac: number }[] = [];
          for (const r of requests) {
            const need = Math.ceil(r.len / blockSize);
            for (let b = 0; b < need; b++) {
              const fillTokens =
                b === need - 1 ? r.len - b * blockSize : blockSize;
              blocks.push({
                reqId: r.id,
                color: r.color,
                usedFrac: fillTokens / blockSize,
              });
            }
          }
          // Pad with free blocks up to some grid size for visual context
          const totalBlocks = Math.max(blocks.length + 12, blocksPerRow * 3);
          while (blocks.length < totalBlocks) blocks.push({ reqId: null, color: "transparent", usedFrac: 0 });

          return blocks.slice(0, blocksPerRow * 4).map((blk, i) => {
            const row = Math.floor(i / blocksPerRow);
            const col = i % blocksPerRow;
            const x = padX + col * blockPxW;
            const y = pagedY + 8 + row * (blockPxH + 3);
            if (blk.reqId == null) {
              return (
                <rect key={i} x={x} y={y} width={blockPxW - 2} height={blockPxH} rx={1.5} fill="color-mix(in oklch, var(--color-foreground) 3%, transparent)" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.8" strokeDasharray="2 2" />
              );
            }
            return (
              <g key={i}>
                <rect x={x} y={y} width={blockPxW - 2} height={blockPxH} rx={1.5} fill="color-mix(in oklch, var(--color-foreground) 4%, transparent)" stroke={blk.color} strokeWidth="1" />
                <rect x={x} y={y} width={(blockPxW - 2) * blk.usedFrac} height={blockPxH} rx={1.5} fill={`color-mix(in oklch, ${blk.color} 36%, transparent)`} />
              </g>
            );
          });
        })()}

        <text x={padX} y={H - 14} className="fill-current font-mono text-[10px] font-semibold" style={{ fill: "var(--color-success)" }}>
          fragmentation = {(pagedFrag * 100).toFixed(1)}%  (only the last block of each request is partially filled)
        </text>
      </svg>

      <div className="px-1">
        <label className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground mb-1">
          <span>block size (tokens)</span>
          <span className="tabular-nums text-foreground">{blockSize}</span>
        </label>
        <input type="range" min={4} max={64} step={4} value={blockSize} onChange={(e) => setBlockSize(parseInt(e.target.value, 10))} className="w-full accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2" aria-label="Block size" />
        <p className="text-[10px] font-mono text-muted-foreground mt-1">
          Smaller blocks → less last-block waste but more block-table entries. vLLM default = 16.
        </p>
      </div>
    </div>
  );
}
