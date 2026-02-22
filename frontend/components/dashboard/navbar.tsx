"use client"

import Link from "next/link"
import { useAppState } from "@/lib/app-state"
import { AlertTriangle, ListChecks, FileText, Download } from "lucide-react"

function StepIndicator({ hasRun }: { hasRun: boolean }) {
  const steps = ["Intake", "Simulation", "Insights"]
  const current = hasRun ? 2 : 0

  return (
    <div className="hidden items-center gap-1 md:flex">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          {i > 0 && (
            <div className={`h-px w-4 ${i <= current ? "bg-primary/40" : "bg-border"}`} />
          )}
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
              i <= current
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DashboardNavbar() {
  const { setActivePanel, hasRun } = useAppState()

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
            PlanSight
          </Link>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Demo
          </span>
        </div>

        {/* Center */}
        <StepIndicator hasRun={hasRun} />

        {/* Right */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActivePanel("failure")}
            disabled={!hasRun}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Failure Forecast</span>
          </button>
          <button
            onClick={() => setActivePanel("tasks")}
            disabled={!hasRun}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Task Blueprint</span>
          </button>
          <button
            onClick={() => setActivePanel("summary")}
            disabled={!hasRun}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Summary</span>
          </button>
          <div className="mx-1 h-4 w-px bg-border" />
          <button
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            title="Export (coming soon)"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>
    </header>
  )
}
