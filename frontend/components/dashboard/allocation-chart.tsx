"use client"

import type { SmartAllocation } from "@/lib/types"

export function AllocationChart({ allocation }: { allocation: SmartAllocation }) {
  const segments = [
    { label: "Frontend", pct: allocation.frontend_pct, color: "bg-primary" },
    { label: "Backend", pct: allocation.backend_pct, color: "bg-foreground" },
    { label: "DevOps", pct: allocation.devops_pct, color: "bg-muted-foreground" },
  ]
  const total = segments.reduce((s, seg) => s + seg.pct, 0)

  return (
    <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Allocation</h3>

      {/* Stacked bar */}
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-700`}
            style={{ width: `${(seg.pct / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${seg.color}`} />
            <span className="text-xs text-muted-foreground">{seg.label}</span>
            <span className="text-xs font-medium tabular-nums text-foreground">{Math.round(seg.pct)}%</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{allocation.recommendation}</p>
    </div>
  )
}
