"use client"

import Link from "next/link"
import { useAppState } from "@/lib/app-state"
import { AlertTriangle, ListChecks, FileText, Download } from "lucide-react"

function StepIndicator({ hasRun }: { hasRun: boolean }) {
  const steps = ["Intake", "Simulation", "Insights"]
  const current = hasRun ? 2 : 0

  return (
    <div className="hidden items-center gap-1.5 md:flex">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1.5">
          {i > 0 && (
            <div className={`h-px w-6 transition-all duration-500 ${i <= current ? "bg-primary/50" : "bg-border"}`} />
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-300 ${
              i <= current
                ? "bg-primary/15 text-primary ring-1 ring-primary/20"
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
    <header className="animate-slide-down sticky top-0 z-40 border-b border-border/30 bg-background/50 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary">
            PlanSight
          </Link>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/20">
            Demo
          </span>
        </div>

        {/* Center */}
        <StepIndicator hasRun={hasRun} />

        {/* Right */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setActivePanel("failure")}
            disabled={!hasRun}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Failure Forecast</span>
          </button>
          <button
            onClick={() => setActivePanel("tasks")}
            disabled={!hasRun}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Task Blueprint</span>
          </button>
          <button
            onClick={() => setActivePanel("summary")}
            disabled={!hasRun}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Summary</span>
          </button>
          <div className="mx-1.5 h-4 w-px bg-border/50" />
          <button
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            title="Export (coming soon)"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>
    </header>
  )
}
