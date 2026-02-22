"use client"

import { useAppState } from "@/lib/app-state"
import { Skeleton } from "@/components/ui/skeleton"
import { HeroMetrics } from "@/components/dashboard/hero-metrics"
import { DistributionChart } from "@/components/dashboard/distribution-chart"
import { MonteCarloAnalysis } from "@/components/dashboard/monte-carlo-analysis"
import { FanChart } from "@/components/dashboard/fan-chart"
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap"
import { TeamStressGauge } from "@/components/dashboard/team-stress"
import { AllocationChart } from "@/components/dashboard/allocation-chart"
import { BarChart3 } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
        <Skeleton className="mb-4 h-4 w-32 bg-secondary" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-20 rounded-lg bg-secondary" />
          <Skeleton className="h-20 rounded-lg bg-secondary" />
          <Skeleton className="h-20 rounded-lg bg-secondary" />
          <Skeleton className="h-20 rounded-lg bg-secondary" />
        </div>
      </div>
      <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
        <Skeleton className="mb-4 h-4 w-40 bg-secondary" />
        <Skeleton className="h-48 rounded-lg bg-secondary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-36 rounded-xl bg-secondary" />
        <Skeleton className="h-36 rounded-xl bg-secondary" />
        <Skeleton className="h-36 rounded-xl bg-secondary" />
        <Skeleton className="h-36 rounded-xl bg-secondary" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-8 py-24 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <BarChart3 className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-sm font-medium text-foreground">No simulation yet</h3>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
        Fill in the Project DNA form and run a simulation to see probability curves, risk breakdowns, and timeline predictions.
      </p>
    </div>
  )
}

export function ResultsDashboard() {
  const { formData, baseline, scenario, isSimulating, hasRun } = useAppState()

  if (isSimulating) return <LoadingSkeleton />
  if (!hasRun || !baseline) return <EmptyState />

  const active = scenario || baseline

  return (
    <div className="flex flex-col gap-4">
      <HeroMetrics data={active} baseline={scenario ? baseline : undefined} />
      <MonteCarloAnalysis
        data={active.distribution}
        p50={active.p50_weeks}
        p90={active.p90_weeks}
        deadline={formData.deadline_weeks}
        numSimulations={active.num_simulations}
      />
      <FanChart
        p50={active.p50_weeks}
        p90={active.p90_weeks}
        deadline={formData.deadline_weeks}
        numSimulations={active.num_simulations}
        complexity={formData.complexity}
        teamSize={formData.team_junior + formData.team_mid + formData.team_senior}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <RiskHeatmap risks={active.risks} />
        <div className="flex flex-col gap-4">
          <TeamStressGauge stress={active.team_stress} />
          <AllocationChart allocation={active.allocation} />
        </div>
      </div>
    </div>
  )
}
