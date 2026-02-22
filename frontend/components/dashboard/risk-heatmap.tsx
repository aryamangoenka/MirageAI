"use client"

import type { RiskBreakdown } from "@/lib/types"
import { Plug, Users, TrendingUp, BookOpen } from "lucide-react"

function riskBg(level: string) {
  if (level === "High") return "from-destructive/12 to-destructive/4 ring-destructive/20 hover:ring-destructive/35"
  if (level === "Medium") return "from-primary/12 to-primary/4 ring-primary/20 hover:ring-primary/35"
  return "from-success/8 to-success/3 ring-success/15 hover:ring-success/30"
}

function barColor(score: number) {
  if (score > 65) return "bg-gradient-to-r from-destructive/80 to-destructive"
  if (score > 35) return "bg-gradient-to-r from-primary/80 to-primary"
  return "bg-gradient-to-r from-success/80 to-success"
}

function badgeStyle(level: string) {
  if (level === "High") return "bg-destructive/15 text-destructive ring-1 ring-destructive/25"
  if (level === "Medium") return "bg-primary/15 text-primary ring-1 ring-primary/25"
  return "bg-success/15 text-success ring-1 ring-success/25"
}

function levelEmoji(level: string) {
  if (level === "High") return "🔴"
  if (level === "Medium") return "🟡"
  return "🟢"
}

const RISK_META: Record<
  string,
  { label: string; icon: React.ReactNode; plain: (score: number) => string }
> = {
  integration_risk: {
    label: "Integration Risk",
    icon: <Plug className="h-4 w-4" />,
    plain: (s) =>
      s > 65
        ? "Too many moving parts — connecting these APIs and services will likely cause delays."
        : s > 35
        ? "Some integration complexity. Budget a bit of extra time for setup."
        : "Integrations look manageable. Low chance of blockers here.",
  },
  team_imbalance_risk: {
    label: "Team Balance",
    icon: <Users className="h-4 w-4" />,
    plain: (s) =>
      s > 65
        ? "Team composition is lopsided — some roles may be overloaded while others are idle."
        : s > 35
        ? "Slight imbalance. Keep an eye on who's doing what."
        : "Team is well-balanced. Roles are distributed appropriately.",
  },
  scope_creep_risk: {
    label: "Scope Creep",
    icon: <TrendingUp className="h-4 w-4" />,
    plain: (s) =>
      s > 65
        ? "High chance of the project growing beyond original scope — lock requirements early."
        : s > 35
        ? "Some scope drift expected. Use a clear change-control process."
        : "Scope looks stable. Requirements appear well-defined.",
  },
  learning_curve_risk: {
    label: "Learning Curve",
    icon: <BookOpen className="h-4 w-4" />,
    plain: (s) =>
      s > 65
        ? "The team is working with unfamiliar tech — expect slower early velocity."
        : s > 35
        ? "Some ramp-up time needed for parts of the stack."
        : "Team has solid familiarity with the tools. Minimal ramp-up expected.",
  },
}

export function RiskHeatmap({ risks }: { risks: RiskBreakdown }) {
  const entries = Object.entries(risks) as [keyof RiskBreakdown, RiskBreakdown[keyof RiskBreakdown]][]

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
        Risk Radar
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {entries.map(([key, risk], i) => {
          const meta = RISK_META[key]
          if (!meta) return null
          return (
            <div
              key={key}
              className={`animate-bounce-in rounded-2xl bg-gradient-to-br p-4 ring-1 transition-all duration-300 ${riskBg(risk.level)}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Icon + label row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl ring-1 ${
                      risk.level === "High"
                        ? "bg-destructive/10 text-destructive ring-destructive/20"
                        : risk.level === "Medium"
                        ? "bg-primary/10 text-primary ring-primary/20"
                        : "bg-success/10 text-success ring-success/20"
                    }`}
                  >
                    {meta.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{meta.label}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${badgeStyle(risk.level)}`}
                >
                  {levelEmoji(risk.level)} {risk.level}
                </span>
              </div>

              {/* Score bar */}
              <div className="mb-2.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/40">
                  <div
                    className={`h-full rounded-full animate-progress-fill ${barColor(risk.score)}`}
                    style={{
                      width: `${Math.min(100, risk.score)}%`,
                      animationDelay: `${200 + i * 100}ms`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold tabular-nums text-foreground w-8 text-right">
                  {Math.round(risk.score)}
                </span>
              </div>

              {/* Plain-language interpretation */}
              <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                {meta.plain(risk.score)}
              </p>

              {/* Original uplift note */}
              {risk.uplift && (
                <p className="mt-1.5 text-[9px] leading-relaxed text-muted-foreground/55 border-t border-border/20 pt-1.5">
                  {risk.uplift}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
