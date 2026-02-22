"use client"

import type { TeamStress } from "@/lib/types"
import { CountUp } from "@/components/dashboard/count-up"

function stressEmoji(label: string) {
  if (label === "Critical") return "🔥"
  if (label === "Elevated") return "⚠️"
  return "😊"
}

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

function stressBg(label: string) {
  if (label === "Critical") return "from-destructive/12 to-destructive/4 ring-destructive/20"
  if (label === "Elevated") return "from-primary/12 to-primary/4 ring-primary/20"
  return "from-success/10 to-success/3 ring-success/15"
}

function stressPlain(label: string, score: number) {
  if (label === "Critical")
    return "Team is overloaded. Risk of burnout is high — consider extending the deadline or reducing scope."
  if (label === "Elevated")
    return `Workload is manageable but tight (score: ${score}). Keep an eye on blockers and avoid scope additions.`
  return "Team workload looks healthy. No burnout risk detected."
}

export function TeamStressGauge({ stress }: { stress: TeamStress }) {
  const pct = Math.min(100, stress.score)
  // Build 10 segment indicators
  const segments = Array.from({ length: 10 }, (_, i) => i + 1)
  const filledCount = Math.round(pct / 10)

  return (
    <div className={`glass-card p-5 animate-bounce-in`}>
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
        Team Workload
      </h3>

      {/* Emoji + score */}
      <div className="mb-4 flex items-center gap-4">
        <div
          className={`flex flex-col items-center rounded-2xl bg-gradient-to-br ${stressBg(stress.label)} p-3.5 ring-1 min-w-[72px]`}
        >
          <span className="text-2xl mb-1">{stressEmoji(stress.label)}</span>
          <span className={`text-xl font-bold tabular-nums ${stressColor(stress.label)}`}>
            <CountUp value={stress.score} decimals={0} />
          </span>
          <span className={`text-[10px] font-medium mt-0.5 ${stressColor(stress.label)}`}>
            {stress.label}
          </span>
        </div>

        {/* Segmented bar */}
        <div className="flex-1">
          <div className="mb-2 flex gap-1">
            {segments.map((seg) => (
              <div
                key={seg}
                className={`h-3 flex-1 rounded-sm transition-all duration-300 animate-progress-fill ${
                  seg <= filledCount
                    ? stressBarColor(stress.label)
                    : "bg-secondary/30"
                }`}
                style={{ animationDelay: `${seg * 60}ms` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground/50">
            <span>Low</span>
            <span>Moderate</span>
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Plain-language note */}
      <p className="text-[11px] leading-relaxed text-muted-foreground/80">
        {stressPlain(stress.label, stress.score)}
      </p>

      {/* Mitigation suggestion */}
      {stress.mitigation && (
        <div className="mt-3 rounded-xl bg-secondary/20 p-2.5 text-[10px] leading-relaxed text-muted-foreground/70 ring-1 ring-border/20">
          💡 {stress.mitigation}
        </div>
      )}
    </div>
  )
}
