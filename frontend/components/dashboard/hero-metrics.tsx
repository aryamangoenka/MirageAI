"use client"

import { useState, useEffect } from "react"
import type { SimulationResponse } from "@/lib/types"
import { CountUp } from "@/components/dashboard/count-up"
import { useAppState } from "@/lib/app-state"
import { MessageCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"

function probColor(p: number) {
  if (p > 70) return "text-success"
  if (p > 40) return "text-primary"
  return "text-destructive"
}

function probBg(p: number) {
  if (p > 70) return "from-success/15 to-success/5 ring-success/20"
  if (p > 40) return "from-primary/15 to-primary/5 ring-primary/20"
  return "from-destructive/15 to-destructive/5 ring-destructive/20"
}

function friendlyHeadline(p: number): { text: string; icon: React.ReactNode } {
  if (p > 75)
    return {
      text: "Looking great — your timeline is realistic and well-resourced.",
      icon: <TrendingUp className="h-4 w-4 text-success" />,
    }
  if (p > 50)
    return {
      text: "Decent odds, but a bit of buffer time would help.",
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
    }
  if (p > 30)
    return {
      text: "Risk is elevated. Consider adjusting scope or team size.",
      icon: <TrendingDown className="h-4 w-4 text-primary" />,
    }
  return {
    text: "High risk of delay. This plan likely needs restructuring.",
    icon: <TrendingDown className="h-4 w-4 text-destructive" />,
  }
}

function Delta({
  current,
  baseline,
  suffix = "",
  invert = false,
}: {
  current: number
  baseline: number
  suffix?: string
  invert?: boolean
}) {
  const diff = current - baseline
  if (Math.abs(diff) < 0.1) return null
  const isGood = invert ? diff < 0 : diff > 0
  return (
    <span
      className={`ml-1.5 text-[11px] font-medium animate-ticker-up ${
        isGood ? "text-success" : "text-destructive"
      }`}
    >
      {diff > 0 ? "+" : ""}
      {diff.toFixed(1)}
      {suffix}
    </span>
  )
}

export function HeroMetrics({
  data,
  baseline,
}: {
  data: SimulationResponse
  baseline?: SimulationResponse
}) {
  const [pulse, setPulse] = useState(false)
  const { setShowAdvisor } = useAppState()
  const headline = friendlyHeadline(data.on_time_probability)

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 1500)
    return () => clearTimeout(t)
  }, [data.on_time_probability])

  return (
    <div
      className={`glass-card p-5 transition-all duration-500 ${
        pulse ? "glow-border ring-1 ring-primary/20" : ""
      }`}
    >
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Your Project Outlook
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tabular-nums text-muted-foreground/60">
            {data.num_simulations.toLocaleString()} scenarios run
          </span>
          <button
            onClick={() => setShowAdvisor(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/90 px-3 py-1.5 text-[11px] font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary hover:shadow-primary/30 active:scale-95"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask AI
          </button>
        </div>
      </div>

      {/* Plain-language headline */}
      <div className="insight-callout mb-4 flex items-start gap-2.5 p-3.5 animate-fade-in">
        <span className="mt-0.5 shrink-0">{headline.icon}</span>
        <p className="text-sm leading-snug text-foreground/90">{headline.text}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* On-time probability — HERO card */}
        <div
          className={`col-span-2 flex flex-col rounded-2xl bg-gradient-to-br ${probBg(
            data.on_time_probability
          )} p-4 ring-1 md:col-span-1 animate-bounce-in`}
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Chance of finishing on time
          </span>
          <span
            className={`mt-1 text-4xl font-bold tabular-nums tracking-tight animate-number-highlight ${probColor(
              data.on_time_probability
            )}`}
          >
            <CountUp value={data.on_time_probability} suffix="%" />
          </span>
          {baseline && (
            <Delta
              current={data.on_time_probability}
              baseline={baseline.on_time_probability}
              suffix="%"
            />
          )}
        </div>

        {/* Expected finish */}
        <div className="flex flex-col rounded-2xl bg-secondary/30 p-4 ring-1 ring-border/30 transition-all duration-200 hover:bg-secondary/40 animate-bounce-in delay-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Expected finish
          </span>
          <span className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            <CountUp value={data.p50_weeks} suffix="w" />
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground/60">50% of scenarios</span>
          {baseline && (
            <Delta current={data.p50_weeks} baseline={baseline.p50_weeks} suffix="w" invert />
          )}
        </div>

        {/* Worst case */}
        <div className="flex flex-col rounded-2xl bg-secondary/30 p-4 ring-1 ring-border/30 transition-all duration-200 hover:bg-secondary/40 animate-bounce-in delay-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Worst case
          </span>
          <span className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            <CountUp value={data.p90_weeks} suffix="w" />
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground/60">Plan for this date</span>
          {baseline && (
            <Delta current={data.p90_weeks} baseline={baseline.p90_weeks} suffix="w" invert />
          )}
        </div>

        {/* Delay risk */}
        <div className="flex flex-col rounded-2xl bg-secondary/30 p-4 ring-1 ring-border/30 transition-all duration-200 hover:bg-secondary/40 animate-bounce-in delay-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Expected delay
          </span>
          <span className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            <CountUp value={data.expected_overrun_days} suffix="d" />
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground/60">extra buffer needed</span>
          {baseline && (
            <Delta
              current={data.expected_overrun_days}
              baseline={baseline.expected_overrun_days}
              suffix="d"
              invert
            />
          )}
        </div>
      </div>

      {/* Budget + confidence band */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-border/30 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Expected budget
          </span>
          <span className="text-sm font-medium tabular-nums text-foreground">
            $<CountUp value={data.p50_cost} decimals={0} />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Budget ceiling
          </span>
          <span className="text-sm font-medium tabular-nums text-foreground">
            $<CountUp value={data.p90_cost} decimals={0} />
          </span>
        </div>
        {/* Timeline band */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              Timeline range
            </span>
            <div className="relative h-2 flex-1 rounded-full bg-secondary/40">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-success/50 to-destructive/50 animate-sweep-in"
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
