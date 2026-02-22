"use client"

import type { TeamStress } from "@/lib/types"
import { CountUp } from "@/components/dashboard/count-up"

function stressColor(label: string) {
  if (label === "Critical") return "text-destructive"
  if (label === "Elevated") return "text-primary"
  return "text-success"
}

function stressBarColor(label: string) {
  if (label === "Critical") return "bg-gradient-to-r from-destructive/80 to-destructive"
  if (label === "Elevated") return "bg-gradient-to-r from-primary/80 to-primary"
  return "bg-gradient-to-r from-success/80 to-success"
}

function stressRing(label: string) {
  if (label === "Critical") return "ring-destructive/20 from-destructive/10 to-destructive/5"
  if (label === "Elevated") return "ring-primary/20 from-primary/10 to-primary/5"
  return "ring-success/20 from-success/10 to-success/5"
}

export function TeamStressGauge({ stress }: { stress: TeamStress }) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
        Team Stress
      </h3>
      <div className="flex items-center gap-4">
        <div className={`flex flex-col items-center rounded-xl bg-gradient-to-br ${stressRing(stress.label)} p-3 ring-1`}>
          <span className={`text-2xl font-semibold tabular-nums ${stressColor(stress.label)}`}>
            <CountUp value={stress.score} decimals={0} />
          </span>
          <span className={`mt-0.5 text-[10px] font-medium ${stressColor(stress.label)}`}>{stress.label}</span>
        </div>
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/40">
            <div
              className={`h-full rounded-full animate-progress-fill ${stressBarColor(stress.label)}`}
              style={{ width: `${Math.min(100, stress.score)}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">{stress.mitigation}</p>
    </div>
  )
}
