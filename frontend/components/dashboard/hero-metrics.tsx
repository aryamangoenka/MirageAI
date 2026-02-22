"use client"

import { useState, useEffect } from "react"
import type { SimulationResponse } from "@/lib/types"
import { CountUp } from "@/components/dashboard/count-up"
import { useAppState } from "@/lib/app-state"
import { MessageCircle } from "lucide-react"

function probColor(p: number) {
  if (p > 70) return "text-success"
  if (p > 40) return "text-primary"
  return "text-destructive"
}

function Delta({ current, baseline, suffix = "", invert = false }: { current: number; baseline: number; suffix?: string; invert?: boolean }) {
  const diff = current - baseline
  if (Math.abs(diff) < 0.1) return null
  const isGood = invert ? diff < 0 : diff > 0
  return (
    <span className={`ml-1.5 text-xs font-medium ${isGood ? "text-success" : "text-destructive"}`}>
      {diff > 0 ? "+" : ""}{diff.toFixed(1)}{suffix}
    </span>
  )
}

export function HeroMetrics({ data, baseline }: { data: SimulationResponse; baseline?: SimulationResponse }) {
  const [pulse, setPulse] = useState(false)
  const { setShowAdvisor } = useAppState()

  // Pulse border on data change
  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 1500)
    return () => clearTimeout(t)
  }, [data.on_time_probability])

  return (
    <div className={`rounded-xl border bg-card/60 p-6 backdrop-blur-sm transition-all ${pulse ? "glow-card glow-border" : "border-border glow-card"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prediction Snapshot</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {data.num_simulations.toLocaleString()} Monte Carlo runs
          </span>
          <button
            onClick={() => setShowAdvisor(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask AI Advisor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* On-time probability - HERO */}
        <div className="col-span-2 flex flex-col items-start rounded-lg bg-secondary/50 p-4 md:col-span-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">On-time</span>
          <span className={`text-3xl font-semibold tabular-nums tracking-tight ${probColor(data.on_time_probability)}`}>
            <CountUp value={data.on_time_probability} suffix="%" />
          </span>
          {baseline && <Delta current={data.on_time_probability} baseline={baseline.on_time_probability} suffix="%" />}
        </div>

        {/* P50 */}
        <div className="flex flex-col rounded-lg bg-secondary/50 p-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">P50</span>
          <span className="text-xl font-semibold tabular-nums text-foreground">
            <CountUp value={data.p50_weeks} suffix="w" />
          </span>
          {baseline && <Delta current={data.p50_weeks} baseline={baseline.p50_weeks} suffix="w" invert />}
        </div>

        {/* P90 */}
        <div className="flex flex-col rounded-lg bg-secondary/50 p-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">P90</span>
          <span className="text-xl font-semibold tabular-nums text-foreground">
            <CountUp value={data.p90_weeks} suffix="w" />
          </span>
          {baseline && <Delta current={data.p90_weeks} baseline={baseline.p90_weeks} suffix="w" invert />}
        </div>

        {/* Overrun */}
        <div className="flex flex-col rounded-lg bg-secondary/50 p-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Overrun</span>
          <span className="text-xl font-semibold tabular-nums text-foreground">
            <CountUp value={data.expected_overrun_days} suffix="d" />
          </span>
          {baseline && <Delta current={data.expected_overrun_days} baseline={baseline.expected_overrun_days} suffix="d" invert />}
        </div>
      </div>

      {/* Cost row + confidence band */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-border pt-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">P50 Cost</span>
          <span className="ml-2 text-sm font-medium tabular-nums text-foreground">
            $<CountUp value={data.p50_cost} decimals={0} />
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">P90 Cost</span>
          <span className="ml-2 text-sm font-medium tabular-nums text-foreground">
            $<CountUp value={data.p90_cost} decimals={0} />
          </span>
        </div>
        {/* Confidence band */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Band</span>
            <div className="relative h-1.5 flex-1 rounded-full bg-secondary">
              <div
                className="absolute h-full rounded-full bg-primary/40"
                style={{
                  left: `${(data.p50_weeks / (data.p90_weeks * 1.3)) * 100}%`,
                  right: `${100 - (data.p90_weeks / (data.p90_weeks * 1.3)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
