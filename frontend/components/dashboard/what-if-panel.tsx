"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useAppState } from "@/lib/app-state"
import { Loader2, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react"

function DeltaControl({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
  options: { label: string; value: number }[]
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{description}</p>
      </div>
      <div className="flex shrink-0 rounded-xl border border-border/40 bg-secondary/20 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              value === opt.value
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CompareMetric({
  label,
  baseline,
  current,
  suffix,
  invert = false,
}: {
  label: string
  baseline: number
  current: number
  suffix: string
  invert?: boolean
}) {
  const diff = current - baseline
  const isGood = invert ? diff < 0 : diff > 0
  const noChange = Math.abs(diff) < 0.1

  const color = noChange ? "text-muted-foreground" : isGood ? "text-success" : "text-destructive"
  const Icon = noChange ? Minus : isGood ? TrendingUp : TrendingDown

  return (
    <div className="flex flex-col rounded-2xl bg-secondary/20 px-3 py-3 ring-1 ring-border/20 transition-all duration-200 hover:bg-secondary/30 gap-1.5 animate-bounce-in">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[12px] tabular-nums text-muted-foreground/60">
          {baseline.toFixed(1)}{suffix}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        <span className={`text-sm font-semibold tabular-nums ${color}`}>
          {current.toFixed(1)}{suffix}
        </span>
        <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
      </div>
      {!noChange && (
        <span className={`text-[10px] font-medium ${color} animate-ticker-up`}>
          {diff > 0 ? "+" : ""}{diff.toFixed(1)}{suffix} vs baseline
        </span>
      )}
    </div>
  )
}

export function WhatIfPanel() {
  const { baseline, hasRun, runScenarioAction, isScenarioRunning, scenario } = useAppState()
  const [seniorDelta, setSeniorDelta] = useState(0)
  const [integrationsDelta, setIntegrationsDelta] = useState(0)
  const [deadlineDelta, setDeadlineDelta] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasChanges = seniorDelta !== 0 || integrationsDelta !== 0 || deadlineDelta !== 0

  const triggerScenario = useCallback(
    (s: number, i: number, d: number) => {
      if (!baseline) return
      if (s === 0 && i === 0 && d === 0) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        runScenarioAction(s, i, d)
      }, 400)
    },
    [baseline, runScenarioAction]
  )

  function updateSenior(v: number) {
    setSeniorDelta(v)
    triggerScenario(v, integrationsDelta, deadlineDelta)
  }
  function updateIntegrations(v: number) {
    setIntegrationsDelta(v)
    triggerScenario(seniorDelta, v, deadlineDelta)
  }
  function updateDeadline(v: number) {
    setDeadlineDelta(v)
    triggerScenario(seniorDelta, integrationsDelta, v)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  if (!hasRun || !baseline) return null

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">What-If Simulator</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Tweak these and watch your odds change instantly
          </p>
        </div>
        {isScenarioRunning && (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[10px] text-primary">Recalculating…</span>
          </div>
        )}
      </div>

      {/* Mode pills */}
      <div className="mb-4 flex rounded-xl border border-border/40 bg-secondary/20 p-0.5">
        <span
          className={`flex-1 rounded-lg px-3 py-1.5 text-center text-[11px] font-medium transition-all duration-300 ${
            !hasChanges ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground"
          }`}
        >
          Baseline
        </span>
        <span
          className={`flex-1 rounded-lg px-3 py-1.5 text-center text-[11px] font-medium transition-all duration-300 ${
            hasChanges ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground"
          }`}
        >
          Scenario
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <DeltaControl
          label="Senior Developer"
          description="Add or remove a senior engineer"
          value={seniorDelta}
          onChange={updateSenior}
          options={[
            { label: "−1", value: -1 },
            { label: "0", value: 0 },
            { label: "+1", value: 1 },
          ]}
        />
        <DeltaControl
          label="Integrations"
          description="Add or remove an external API/service"
          value={integrationsDelta}
          onChange={updateIntegrations}
          options={[
            { label: "−1", value: -1 },
            { label: "0", value: 0 },
            { label: "+1", value: 1 },
          ]}
        />
        <DeltaControl
          label="Deadline"
          description="Push or pull your target date"
          value={deadlineDelta}
          onChange={updateDeadline}
          options={[
            { label: "−2w", value: -2 },
            { label: "0", value: 0 },
            { label: "+2w", value: 2 },
          ]}
        />
      </div>

      {/* Comparison grid */}
      {scenario && hasChanges && (
        <div className="mt-5 border-t border-border/30 pt-4">
          <p className="mb-3 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Impact on your project
          </p>
          <div className="grid grid-cols-2 gap-2">
            <CompareMetric
              label="On-time chance"
              baseline={baseline.on_time_probability}
              current={scenario.on_time_probability}
              suffix="%"
            />
            <CompareMetric
              label="Expected finish"
              baseline={baseline.p50_weeks}
              current={scenario.p50_weeks}
              suffix="w"
              invert
            />
            <CompareMetric
              label="Worst case"
              baseline={baseline.p90_weeks}
              current={scenario.p90_weeks}
              suffix="w"
              invert
            />
            <CompareMetric
              label="Expected delay"
              baseline={baseline.expected_overrun_days}
              current={scenario.expected_overrun_days}
              suffix="d"
              invert
            />
          </div>
        </div>
      )}
    </div>
  )
}
