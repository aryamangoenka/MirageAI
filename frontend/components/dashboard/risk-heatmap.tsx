"use client"

import type { RiskBreakdown } from "@/lib/types"

function riskColor(level: string) {
  if (level === "High") return "bg-destructive/15 text-destructive"
  if (level === "Medium") return "bg-primary/15 text-primary"
  return "bg-secondary text-muted-foreground"
}

function barColor(score: number) {
  if (score > 65) return "bg-destructive"
  if (score > 35) return "bg-primary"
  return "bg-success"
}

const RISK_LABELS: Record<string, string> = {
  integration_risk: "Integration",
  team_imbalance_risk: "Team Imbalance",
  scope_creep_risk: "Scope Creep",
  learning_curve_risk: "Learning Curve",
}

export function RiskHeatmap({ risks }: { risks: RiskBreakdown }) {
  const entries = Object.entries(risks) as [keyof RiskBreakdown, RiskBreakdown[keyof RiskBreakdown]][]

  return (
    <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Heatmap</h3>
      <div className="grid grid-cols-2 gap-3">
        {entries.map(([key, risk]) => (
          <div key={key} className="rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:bg-secondary/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{RISK_LABELS[key]}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${riskColor(risk.level)}`}>
                {risk.level}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor(risk.score)}`}
                  style={{ width: `${Math.min(100, risk.score)}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-foreground">{Math.round(risk.score)}</span>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">{risk.uplift}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
