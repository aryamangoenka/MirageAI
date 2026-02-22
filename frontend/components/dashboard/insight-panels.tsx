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
      <div className="flex flex-col gap-4 p-4">
        <p className="text-xs text-primary">Analyzing worst-case runs...</p>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 bg-secondary" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-destructive">Failed to load forecast</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Most Likely Failure Sequence</h4>
        <div className="flex flex-col gap-2.5">
          {data.failure_sequence.map((step, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <span className="text-xs leading-relaxed text-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Mitigations</h4>
        <div className="flex flex-col gap-2.5">
          {data.mitigations.map((item, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <span className="text-xs leading-relaxed text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
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
      <div className="flex flex-col gap-3 p-4">
        <p className="text-xs text-primary">Generating task breakdown...</p>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 bg-secondary" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-destructive">Failed to load tasks</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const roleColor: Record<string, string> = {
    FE: "bg-primary/15 text-primary",
    BE: "bg-foreground/10 text-foreground",
    DevOps: "bg-secondary text-muted-foreground",
  }

  const flagColor: Record<string, string> = {
    "High Risk": "bg-destructive/15 text-destructive",
    "Dependency Bottleneck": "bg-primary/15 text-primary",
    "Early Validation": "bg-success/15 text-success",
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{data.tasks.length} tasks in dependency order</span>
        <button
          onClick={copyTasks}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy tasks"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {data.tasks.map((task) => (
          <div key={task.index} className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium tabular-nums text-foreground">
              {task.index}
            </span>
            <div className="flex-1">
              <span className="text-xs font-medium text-foreground">{task.title}</span>
              <div className="mt-1.5 flex gap-1.5">
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${roleColor[task.role] || "bg-secondary text-muted-foreground"}`}>
                  {task.role}
                </span>
                {task.risk_flag && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${flagColor[task.risk_flag] || "bg-secondary text-muted-foreground"}`}>
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
      <div className="flex flex-col gap-3 p-4">
        <p className="text-xs text-primary">Generating executive summary...</p>
        <Skeleton className="h-4 w-full bg-secondary" />
        <Skeleton className="h-4 w-3/4 bg-secondary" />
        <Skeleton className="h-4 w-5/6 bg-secondary" />
        <Skeleton className="h-4 w-2/3 bg-secondary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-destructive">Failed to generate summary</p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Key metrics header */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">On-time</span>
          <span className="ml-1.5 text-xs font-medium text-foreground">{data.key_metrics.on_time_probability}%</span>
        </div>
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">P50/P90</span>
          <span className="ml-1.5 text-xs font-medium text-foreground">{data.key_metrics.p50_weeks}w / {data.key_metrics.p90_weeks}w</span>
        </div>
        <div className="col-span-2 rounded-lg bg-secondary/50 px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Risk</span>
          <span className="ml-1.5 text-xs font-medium text-foreground">{data.key_metrics.top_risk}</span>
        </div>
      </div>

      {/* Summary text */}
      <div className="rounded-lg border border-border bg-secondary/20 p-4">
        <p className="text-xs leading-relaxed text-foreground">{data.summary}</p>
      </div>

      {/* Audio Summary */}
      <div className="rounded-lg border border-border bg-secondary/10 p-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-3">Listen to Summary</h4>
        <ExecutiveSummaryAudio summaryText={data.summary} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={copySummary}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy as text"}
        </button>
        <button
          disabled
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground disabled:opacity-40"
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
      <SheetContent side="right" className="w-full overflow-y-auto border-border bg-card sm:max-w-md">
        {activePanel && (
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-foreground">{TITLES[activePanel]}</SheetTitle>
            <SheetDescription className="text-muted-foreground">{DESCRIPTIONS[activePanel]}</SheetDescription>
          </SheetHeader>
        )}
        {activePanel === "failure" && <FailureForecastPanel onClose={() => setActivePanel(null)} />}
        {activePanel === "tasks" && <TaskBlueprintPanel />}
        {activePanel === "summary" && <ExecutiveSummaryPanel />}
      </SheetContent>
    </Sheet>
  )
}
