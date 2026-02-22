"use client"

import type { SmartAllocation } from "@/lib/types"

export function AllocationChart({ allocation }: { allocation: SmartAllocation }) {
  const segments = [
    { label: "Frontend", pct: allocation.frontend_pct, color: "bg-primary", dot: "bg-primary" },
    { label: "Backend", pct: allocation.backend_pct, color: "bg-foreground", dot: "bg-foreground" },
    { label: "DevOps", pct: allocation.devops_pct, color: "bg-muted-foreground", dot: "bg-muted-foreground" },
  ]
  const total = segments.reduce((s, seg) => s + seg.pct, 0)

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
        Allocation
      </h3>

      {/* Stacked bar */}
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary/40">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className={`${seg.color} animate-progress-fill transition-all duration-700`}
            style={{ width: `${(seg.pct / total) * 100}%`, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${seg.dot}`} />
            <span className="text-[11px] text-muted-foreground">{seg.label}</span>
            <span className="text-[11px] font-medium tabular-nums text-foreground">{Math.round(seg.pct)}%</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">{allocation.recommendation}</p>
    </div>
  )
}
