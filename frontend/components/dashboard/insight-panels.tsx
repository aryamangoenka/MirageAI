"use client"

import { useEffect, useState } from "react"
import { useAppState } from "@/lib/app-state"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchFailureForecast, fetchTaskBreakdown, fetchExecutiveSummary } from "@/lib/api-client"
import type { FailureForecastResponse, TaskBreakdownResponse, ExecutiveSummaryResponse } from "@/lib/types"
import { AlertTriangle, CheckCircle, Copy, Check, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { ExecutiveSummaryAudio } from "@/components/ExecutiveSummaryAudio"

// ── Failure Forecast Panel ──

function FailureForecastPanel({ onClose }: { onClose: () => void }) {
  const { formData } = useAppState()
  const [data, setData] = useState<FailureForecastResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const result = await fetchFailureForecast(formData)
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [formData])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[11px] text-primary">Analyzing worst-case runs...</p>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl bg-secondary/40 shimmer" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-destructive">Failed to load forecast</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-secondary/80 active:scale-95">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
          Most Likely Failure Sequence
        </h4>
        <div className="flex flex-col gap-2">
          {data.failure_sequence.map((step, i) => (
            <div
              key={i}
              className="animate-slide-up flex gap-3 rounded-xl border border-border/30 bg-secondary/20 p-3.5 transition-all duration-200 hover:bg-secondary/30"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive/80" />
              <span className="text-[11px] leading-relaxed text-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-success/60" />
          Top Mitigations
        </h4>
        <div className="flex flex-col gap-2">
          {data.mitigations.map((item, i) => (
            <div
              key={i}
              className="animate-slide-up flex gap-3 rounded-xl border border-border/30 bg-secondary/20 p-3.5 transition-all duration-200 hover:bg-secondary/30"
              style={{ animationDelay: `${(data.failure_sequence.length + i) * 80}ms` }}
            >
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success/80" />
              <span className="text-[11px] leading-relaxed text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full rounded-xl bg-secondary/50 px-3 py-2.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-secondary/70 active:scale-[0.98]"
      >
        Close
      </button>
    </div>
  )
}

// ── Task Blueprint Panel ──

function TaskBlueprintPanel() {
  const { formData, baseline, scenario } = useAppState()
  const [data, setData] = useState<TaskBreakdownResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const active = scenario || baseline

  async function load() {
    if (!active) return
    setLoading(true)
    setError(false)
    try {
      const result = await fetchTaskBreakdown(formData, active)
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [active])

  function copyTasks() {
    if (!data) return
    const text = data.tasks.map((t) => `${t.index}. [${t.role}] ${t.title}${t.risk_flag ? ` (${t.risk_flag})` : ""}`).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast("Tasks copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[11px] text-primary">Generating task breakdown...</p>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-xl bg-secondary/40 shimmer" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-destructive">Failed to load tasks</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-secondary/80 active:scale-95">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const roleColor: Record<string, string> = {
    FE: "bg-primary/10 text-primary ring-1 ring-primary/20",
    BE: "bg-foreground/8 text-foreground ring-1 ring-border/30",
    DevOps: "bg-secondary/60 text-muted-foreground ring-1 ring-border/20",
  }

  const flagColor: Record<string, string> = {
    "High Risk": "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
    "Dependency Bottleneck": "bg-primary/10 text-primary ring-1 ring-primary/20",
    "Early Validation": "bg-success/10 text-success ring-1 ring-success/20",
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{data.tasks.length} tasks in dependency order</span>
        <button
          onClick={copyTasks}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/50 px-3 py-1.5 text-[11px] font-medium text-foreground transition-all duration-200 hover:bg-secondary/70 active:scale-95"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy tasks"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {data.tasks.map((task, i) => (
          <div
            key={task.index}
            className="animate-slide-up flex items-start gap-3 rounded-xl border border-border/30 bg-secondary/15 p-3.5 transition-all duration-200 hover:bg-secondary/25"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-[10px] font-semibold tabular-nums text-foreground">
              {task.index}
            </span>
            <div className="flex-1">
              <span className="text-[11px] font-medium text-foreground">{task.title}</span>
              <div className="mt-1.5 flex gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${roleColor[task.role] || "bg-secondary text-muted-foreground"}`}>
                  {task.role}
                </span>
                {task.risk_flag && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${flagColor[task.risk_flag] || "bg-secondary text-muted-foreground"}`}>
                    {task.risk_flag}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Executive Summary Panel ──

function ExecutiveSummaryPanel() {
  const { formData, baseline, scenario } = useAppState()
  const [data, setData] = useState<ExecutiveSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const active = scenario || baseline

  async function load() {
    if (!active) return
    setLoading(true)
    setError(false)
    try {
      const result = await fetchExecutiveSummary(formData, active)
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [active])

  function copySummary() {
    if (!data) return
    navigator.clipboard.writeText(data.summary)
    setCopied(true)
    toast("Summary copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[11px] text-primary">Generating executive summary...</p>
        </div>
        <Skeleton className="h-4 w-full rounded-lg bg-secondary/40 shimmer" />
        <Skeleton className="h-4 w-3/4 rounded-lg bg-secondary/40 shimmer" style={{ animationDelay: '100ms' }} />
        <Skeleton className="h-4 w-5/6 rounded-lg bg-secondary/40 shimmer" style={{ animationDelay: '200ms' }} />
        <Skeleton className="h-4 w-2/3 rounded-lg bg-secondary/40 shimmer" style={{ animationDelay: '300ms' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-destructive">Failed to generate summary</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-secondary/80 active:scale-95">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-4 p-5 animate-fade-in">
      {/* Key metrics header */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-secondary/30 px-3 py-2.5 ring-1 ring-border/20">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">On-time</span>
          <span className="ml-1.5 text-xs font-medium text-foreground">{data.key_metrics.on_time_probability}%</span>
        </div>
        <div className="rounded-xl bg-secondary/30 px-3 py-2.5 ring-1 ring-border/20">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">P50/P90</span>
          <span className="ml-1.5 text-xs font-medium text-foreground">{data.key_metrics.p50_weeks}w / {data.key_metrics.p90_weeks}w</span>
        </div>
        <div className="col-span-2 rounded-xl bg-secondary/30 px-3 py-2.5 ring-1 ring-border/20">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Top Risk</span>
          <span className="ml-1.5 text-xs font-medium text-foreground">{data.key_metrics.top_risk}</span>
        </div>
      </div>

      {/* Summary text */}
      <div className="rounded-xl border border-border/30 bg-secondary/15 p-4">
        <p className="text-[11px] leading-relaxed text-foreground/90">{data.summary}</p>
      </div>

      {/* Audio Summary */}
      <div className="rounded-xl border border-border/30 bg-secondary/10 p-4">
        <h4 className="text-[11px] font-medium text-muted-foreground mb-3">Listen to Summary</h4>
        <ExecutiveSummaryAudio summaryText={data.summary} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={copySummary}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/90 px-3 py-2.5 text-xs font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary hover:shadow-primary/30 active:scale-[0.98]"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy as text"}
        </button>
        <button
          disabled
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary/50 px-3 py-2.5 text-xs font-medium text-muted-foreground disabled:opacity-40"
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}

// ── Main Insight Panels Shell ──

const TITLES: Record<string, string> = {
  failure: "Failure Forecast",
  tasks: "AI Task Blueprint",
  summary: "Executive Summary",
}

const DESCRIPTIONS: Record<string, string> = {
  failure: "How this project is most likely to fail, and how to prevent it.",
  tasks: "Dependency-ordered task breakdown with role assignments.",
  summary: "A concise executive summary of the simulation results.",
}

export function InsightPanels() {
  const { activePanel, setActivePanel } = useAppState()

  return (
    <Sheet open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border/30 bg-card/95 backdrop-blur-2xl sm:max-w-md">
        {activePanel && (
          <SheetHeader className="px-5 pt-5">
            <SheetTitle className="text-foreground">{TITLES[activePanel]}</SheetTitle>
            <SheetDescription className="text-muted-foreground/80">{DESCRIPTIONS[activePanel]}</SheetDescription>
          </SheetHeader>
        )}
        {activePanel === "failure" && <FailureForecastPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "tasks" && <TaskBlueprintPanel />}
        {activePanel === "summary" && <ExecutiveSummaryPanel />}
      </SheetContent>
    </Sheet>
  )
}
