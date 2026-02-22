"use client"

import { useState } from "react"
import { useAppState } from "@/lib/app-state"
import type { ExecutionPlanResponse, ExecutionPlanPhase, ExecutionPlanTask } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Layers,
  ChevronRight,
  Cpu,
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────────────

function roleColor(role: string) {
  if (role === "FE") return "bg-primary/10 text-primary ring-1 ring-primary/20"
  if (role === "BE") return "bg-foreground/8 text-foreground ring-1 ring-border/30"
  return "bg-secondary/60 text-muted-foreground ring-1 ring-border/20"
}

function priorityDot(priority: string) {
  if (priority === "high") return "bg-destructive"
  if (priority === "medium") return "bg-primary"
  return "bg-muted-foreground"
}

function flagStyle(flag?: string | null) {
  if (flag === "High Risk") return "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
  if (flag === "Dependency Bottleneck") return "bg-primary/10 text-primary ring-1 ring-primary/20"
  if (flag === "Early Validation") return "bg-success/10 text-success ring-1 ring-success/20"
  return ""
}

function phaseBarWidth(phase: ExecutionPlanPhase, deadline: number) {
  const duration = phase.week_end - phase.week_start + 1
  return `${Math.min(100, (duration / Math.max(1, deadline)) * 100)}%`
}

function phaseBarOffset(phase: ExecutionPlanPhase, deadline: number) {
  return `${Math.min(100, ((phase.week_start - 1) / Math.max(1, deadline)) * 100)}%`
}

const PHASE_COLORS = [
  { bg: "from-primary/20 to-primary/8", ring: "ring-primary/25", bar: "bg-primary", text: "text-primary", dot: "bg-primary" },
  { bg: "from-success/15 to-success/5", ring: "ring-success/20", bar: "bg-success", text: "text-success", dot: "bg-success" },
  { bg: "from-destructive/12 to-destructive/4", ring: "ring-destructive/15", bar: "bg-destructive", text: "text-destructive", dot: "bg-destructive" },
  { bg: "from-foreground/10 to-foreground/4", ring: "ring-foreground/15", bar: "bg-foreground/60", text: "text-foreground", dot: "bg-foreground/60" },
  { bg: "from-primary/12 to-primary/4", ring: "ring-primary/15", bar: "bg-primary/70", text: "text-primary/80", dot: "bg-primary/70" },
]

// ── Sub-components ───────────────────────────────────────────────────────────

function TaskRow({ task, i }: { task: ExecutionPlanTask; i: number }) {
  return (
    <div
      className="animate-trail-in flex items-start gap-3 rounded-xl border border-border/25 bg-secondary/15 px-3.5 py-2.5 transition-all duration-200 hover:bg-secondary/25"
      style={{ animationDelay: `${i * 55}ms` }}
    >
      {/* Priority dot */}
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot(task.priority)}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-foreground leading-snug">{task.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${roleColor(task.role)}`}>
            {task.role}
          </span>
          {task.risk_flag && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${flagStyle(task.risk_flag)}`}>
              {task.risk_flag}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PhaseCard({
  phase,
  colorIdx,
  deadline,
  isActive,
}: {
  phase: ExecutionPlanPhase
  colorIdx: number
  deadline: number
  isActive: boolean
}) {
  const c = PHASE_COLORS[colorIdx % PHASE_COLORS.length]
  if (!isActive) return null

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      {/* Phase header */}
      <div className={`rounded-2xl bg-gradient-to-br ${c.bg} p-4 ring-1 ${c.ring}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className={`text-base font-semibold ${c.text}`}>{phase.name}</h4>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Week {phase.week_start} – {phase.week_end}
              <span className="mx-1.5 opacity-40">·</span>
              {phase.week_end - phase.week_start + 1} week{phase.week_end - phase.week_start !== 0 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-[10px] text-muted-foreground ring-1 ring-border/20 shrink-0">
            <Flag className="h-3 w-3" />
            {phase.milestone}
          </div>
        </div>
        <p className="text-[12px] leading-relaxed text-foreground/85">{phase.description}</p>
      </div>

      {/* Tasks */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {phase.tasks.length} task{phase.tasks.length !== 1 ? "s" : ""} this phase
        </p>
        <div className="flex flex-col gap-2">
          {phase.tasks.map((task, i) => (
            <TaskRow key={i} task={task} i={i} />
          ))}
        </div>
      </div>

      {/* Risks */}
      {phase.risks.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Watch out for
          </p>
          <div className="flex flex-col gap-1.5">
            {phase.risks.map((r, i) => (
              <div
                key={i}
                className="flex gap-2.5 rounded-xl border border-destructive/15 bg-destructive/5 px-3 py-2 animate-trail-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive/70" />
                <p className="text-[11px] leading-snug text-foreground/80">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Model badge */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <p className="text-[11px] text-primary">Ollama is reasoning about your project…</p>
      </div>
      {/* Phase pills skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-xl bg-secondary/40 shimmer" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      {/* Timeline bar */}
      <Skeleton className="h-4 w-full rounded-full bg-secondary/30 shimmer" />
      {/* Phase card */}
      <Skeleton className="h-28 rounded-2xl bg-secondary/30 shimmer" />
      {/* Tasks */}
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 rounded-xl bg-secondary/20 shimmer" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ExecutionPlan() {
  const {
    formData,
    executionPlan: plan,
    isExecutionPlanLoading: loading,
    executionPlanError: error,
    regenerateExecutionPlan,
  } = useAppState()

  const [activePhaseIdx, setActivePhaseIdx] = useState(0)

  if (loading) return <LoadingSkeleton />

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">Could not generate execution plan</p>
        <button
          onClick={regenerateExecutionPlan}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-secondary/80 active:scale-95"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  const deadline = formData.deadline_weeks || plan.phases[plan.phases.length - 1]?.week_end || 8
  const totalTasks = plan.phases.reduce((s, p) => s + p.tasks.length, 0)

  return (
    <div className="glass-card p-5 flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0 mt-0.5">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Execution Blueprint</h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              {plan.phases.length} phases · {totalTasks} tasks · {deadline}-week plan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Model badge */}
          <span className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-[9px] font-medium text-muted-foreground ring-1 ring-border/20">
            <Cpu className="h-2.5 w-2.5" />
            Ollama
          </span>
          <button
            onClick={regenerateExecutionPlan}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-secondary/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/70 hover:text-foreground active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </div>

      {/* ── Visual timeline bar ── */}
      <div>
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary/30">
          {plan.phases.map((phase, i) => {
            const c = PHASE_COLORS[i % PHASE_COLORS.length]
            return (
              <div
                key={i}
                className={`absolute top-0 h-full cursor-pointer rounded-full ${c.bar} opacity-70 hover:opacity-100 transition-opacity duration-200 animate-sweep-in`}
                style={{
                  left: phaseBarOffset(phase, deadline),
                  width: phaseBarWidth(phase, deadline),
                  animationDelay: `${i * 120}ms`,
                }}
                onClick={() => setActivePhaseIdx(i)}
                title={`${phase.name}: Week ${phase.week_start}–${phase.week_end}`}
              />
            )
          })}
          {/* Go/no-go markers */}
          {plan.go_no_go_checkpoints.map((cp, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-0.5 bg-foreground/40"
              style={{ left: `${((cp.week - 1) / Math.max(1, deadline)) * 100}%` }}
              title={`Week ${cp.week}: ${cp.condition}`}
            />
          ))}
        </div>
        {/* Week labels */}
        <div className="mt-1 flex justify-between text-[9px] text-muted-foreground/50">
          <span>Week 1</span>
          <span>Week {Math.round(deadline / 2)}</span>
          <span>Week {deadline}</span>
        </div>
      </div>

      {/* ── Phase selector pills ── */}
      <div className="flex gap-1.5 flex-wrap">
        {plan.phases.map((phase, i) => {
          const c = PHASE_COLORS[i % PHASE_COLORS.length]
          const isActive = activePhaseIdx === i
          return (
            <button
              key={i}
              onClick={() => setActivePhaseIdx(i)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-medium transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-br ${c.bg} ring-1 ${c.ring} ${c.text}`
                  : "bg-secondary/20 text-muted-foreground hover:bg-secondary/35 hover:text-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? c.dot : "bg-muted-foreground/40"}`} />
              {phase.name}
              <span className="text-[9px] opacity-60">W{phase.week_start}–{phase.week_end}</span>
            </button>
          )
        })}
      </div>

      {/* ── Active phase content ── */}
      {plan.phases.map((phase, i) => (
        <PhaseCard
          key={i}
          phase={phase}
          colorIdx={i}
          deadline={deadline}
          isActive={activePhaseIdx === i}
        />
      ))}

      {/* ── Go / No-Go checkpoints ── */}
      {plan.go_no_go_checkpoints.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-success/60" />
            Go / No-Go Checkpoints
          </h4>
          <div className="flex flex-col gap-2">
            {plan.go_no_go_checkpoints.map((cp, i) => (
              <div
                key={i}
                className="animate-trail-in flex items-start gap-3 rounded-xl border border-success/15 bg-success/5 px-3.5 py-3 transition-all duration-200 hover:bg-success/8"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success/80" />
                <div>
                  <p className="text-[11px] font-semibold text-foreground/90">Week {cp.week} check-in</p>
                  <p className="text-[11px] leading-snug text-muted-foreground/80 mt-0.5">{cp.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Critical path note ── */}
      {plan.critical_path_note && (
        <div className="insight-callout flex items-start gap-2.5 p-3.5">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-foreground/90">
            <span className="font-semibold text-primary">Critical path: </span>
            {plan.critical_path_note}
          </p>
        </div>
      )}
    </div>
  )
}
