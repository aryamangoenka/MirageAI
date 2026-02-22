"use client"

import type { TeamStress } from "@/lib/types"
import { CountUp } from "@/components/dashboard/count-up"

function stressColor(label: string) {
  if (label === "Critical") return "text-destructive"
  if (label === "Elevated") return "text-primary"
  return "text-success"
}

function stressBarColor(label: string) {
  if (label === "Critical") return "bg-destructive"
  if (label === "Elevated") return "bg-primary"
  return "bg-success"
}

export function TeamStressGauge({ stress }: { stress: TeamStress }) {
  return (
    <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Team Stress</h3>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className={`text-2xl font-semibold tabular-nums ${stressColor(stress.label)}`}>
            <CountUp value={stress.score} decimals={0} />
          </span>
          <span className={`mt-0.5 text-xs font-medium ${stressColor(stress.label)}`}>{stress.label}</span>
        </div>
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-700 ${stressBarColor(stress.label)}`}
              style={{ width: `${Math.min(100, stress.score)}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{stress.mitigation}</p>
    </div>
  )
}
