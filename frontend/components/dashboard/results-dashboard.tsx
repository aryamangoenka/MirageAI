"use client"

import { useState } from "react"
import { useAppState } from "@/lib/app-state"
import { Skeleton } from "@/components/ui/skeleton"
import { HeroMetrics } from "@/components/dashboard/hero-metrics"
import { MonteCarloAnalysis } from "@/components/dashboard/monte-carlo-analysis"
import { FanChart } from "@/components/dashboard/fan-chart"
import { RiskHeatmap } from "@/components/dashboard/risk-heatmap"
import { TeamStressGauge } from "@/components/dashboard/team-stress"
import { AllocationChart } from "@/components/dashboard/allocation-chart"
import { BarChart3, TrendingUp, Shield, Activity } from "lucide-react"

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "distribution", label: "Distribution", icon: BarChart3 },
  { id: "timeline", label: "Timeline", icon: TrendingUp },
  { id: "risk", label: "Risk & Team", icon: Shield },
] as const

type TabId = (typeof TABS)[number]["id"]

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-3 w-3 rounded-full bg-secondary shimmer" />
          <Skeleton className="h-4 w-32 bg-secondary shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-slide-up rounded-xl bg-secondary/40 p-5" style={{ animationDelay: `${i * 80}ms` }}>
              <Skeleton className="mb-2 h-3 w-12 bg-secondary/60 shimmer" />
              <Skeleton className="h-7 w-16 bg-secondary/60 shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <Skeleton className="mb-4 h-4 w-40 bg-secondary shimmer" />
        <Skeleton className="h-52 rounded-xl bg-secondary/40 shimmer" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="animate-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/20 px-8 py-28 text-center backdrop-blur-sm">
      <div className="mb-5 flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
        <BarChart3 className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-medium text-foreground">No simulation yet</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Fill in the Project DNA form and run a simulation to see probability curves, risk breakdowns, and timeline predictions.
      </p>
    </div>
  )
}

export function ResultsDashboard() {
  const { formData, baseline, scenario, isSimulating, hasRun } = useAppState()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  if (isSimulating) return <LoadingSkeleton />
  if (!hasRun || !baseline) return <EmptyState />

  const active = scenario || baseline

  return (
    <div className="flex flex-col gap-5">
      {/* Hero metrics always visible */}
      <div className="animate-slide-up">
        <HeroMetrics data={active} baseline={scenario ? baseline : undefined} />
      </div>

      {/* Tab navigation */}
      <div className="animate-slide-up delay-1">
        <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/40 p-1 backdrop-blur-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            <MonteCarloAnalysis
              data={active.distribution}
              p50={active.p50_weeks}
              p90={active.p90_weeks}
              deadline={formData.deadline_weeks}
              numSimulations={active.num_simulations}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <RiskHeatmap risks={active.risks} />
              <div className="flex flex-col gap-5">
                <TeamStressGauge stress={active.team_stress} />
                <AllocationChart allocation={active.allocation} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "distribution" && (
          <MonteCarloAnalysis
            data={active.distribution}
            p50={active.p50_weeks}
            p90={active.p90_weeks}
            deadline={formData.deadline_weeks}
            numSimulations={active.num_simulations}
          />
        )}

        {activeTab === "timeline" && (
          <FanChart
            p50={active.p50_weeks}
            p90={active.p90_weeks}
            deadline={formData.deadline_weeks}
            numSimulations={active.num_simulations}
            complexity={formData.complexity}
            teamSize={formData.team_junior + formData.team_mid + formData.team_senior}
          />
        )}

        {activeTab === "risk" && (
          <div className="flex flex-col gap-5">
            <RiskHeatmap risks={active.risks} />
            <div className="grid gap-5 md:grid-cols-2">
              <TeamStressGauge stress={active.team_stress} />
              <AllocationChart allocation={active.allocation} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
