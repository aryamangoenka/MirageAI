"use client"

import type { SmartAllocation } from "@/lib/types"

const ROLE_META = [
  {
    key: "frontend_pct" as const,
    label: "Frontend",
    emoji: "🖥️",
    color: "bg-primary",
    dot: "bg-primary",
    bar: "bg-gradient-to-r from-primary/80 to-primary",
    text: "text-primary",
  },
  {
    key: "backend_pct" as const,
    label: "Backend",
    emoji: "⚙️",
    color: "bg-foreground",
    dot: "bg-foreground/70",
    bar: "bg-gradient-to-r from-foreground/60 to-foreground/80",
    text: "text-foreground",
  },
  {
    key: "devops_pct" as const,
    label: "DevOps",
    emoji: "🚀",
    color: "bg-muted-foreground",
    dot: "bg-muted-foreground",
    bar: "bg-gradient-to-r from-muted-foreground/60 to-muted-foreground",
    text: "text-muted-foreground",
  },
]

export function AllocationChart({ allocation }: { allocation: SmartAllocation }) {
  const total = ROLE_META.reduce((s, r) => s + allocation[r.key], 0)

  return (
    <div className="glass-card p-5 animate-bounce-in delay-1">
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
        Suggested Team Split
      </h3>

      {/* Stacked bar */}
      <div className="flex h-4 overflow-hidden rounded-full bg-secondary/40 mb-4">
        {ROLE_META.map((r, i) => (
          <div
            key={r.key}
            className={`${r.bar} animate-progress-fill transition-all duration-700`}
            style={{
              width: `${(allocation[r.key] / total) * 100}%`,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>

      {/* Per-role breakdown */}
      <div className="flex flex-col gap-2.5">
        {ROLE_META.map((r, i) => {
          const pct = Math.round(allocation[r.key])
          const widthPct = (allocation[r.key] / total) * 100
          return (
            <div
              key={r.key}
              className="animate-trail-in flex items-center gap-3"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-base w-6 text-center">{r.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-foreground">{r.label}</span>
                  <span className={`text-[11px] font-bold tabular-nums ${r.text}`}>{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div
                    className={`h-full rounded-full animate-progress-fill ${r.bar}`}
                    style={{ width: `${widthPct}%`, animationDelay: `${200 + i * 80}ms` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allocation.recommendation && (
        <p className="mt-3.5 text-[10px] leading-relaxed text-muted-foreground/80 border-t border-border/30 pt-3">
          💡 {allocation.recommendation}
        </p>
      )}
    </div>
  )
}
