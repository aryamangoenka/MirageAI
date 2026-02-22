"use client"

import type { RiskBreakdown } from "@/lib/types"

function riskColor(level: string) {
  if (level === "High") return "bg-destructive/10 text-destructive ring-destructive/20"
  if (level === "Medium") return "bg-primary/10 text-primary ring-primary/20"
  return "bg-secondary text-muted-foreground ring-border/30"
}

function barColor(score: number) {
  if (score > 65) return "bg-gradient-to-r from-destructive/80 to-destructive"
  if (score > 35) return "bg-gradient-to-r from-primary/80 to-primary"
  return "bg-gradient-to-r from-success/80 to-success"
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
    <div className="glass-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
        Risk Heatmap
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        {entries.map(([key, risk], i) => (
          <div
            key={key}
            className={`animate-scale-in rounded-xl border border-border/30 bg-secondary/20 p-3.5 transition-all duration-300 hover:bg-secondary/40 hover:border-border/50`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">{RISK_LABELS[key]}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ring-1 ${riskColor(risk.level)}`}>
                {risk.level}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/50">
                <div
                  className={`h-full rounded-full animate-progress-fill ${barColor(risk.score)}`}
                  style={{ width: `${Math.min(100, risk.score)}%`, animationDelay: `${200 + i * 100}ms` }}
                />
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-foreground">{Math.round(risk.score)}</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">{risk.uplift}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
