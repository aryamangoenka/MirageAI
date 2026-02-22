"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useAppState } from "@/lib/app-state"
import { Loader2 } from "lucide-react"

function DeltaControl({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  options: { label: string; value: number }[]
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex rounded-xl border border-border/40 bg-secondary/20 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ${
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
          <p className="mt-0.5 text-[11px] text-muted-foreground">Adjust and watch the curve shift</p>
        </div>
        {isScenarioRunning && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>

      {/* Mode indicator */}
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

      <div className="flex flex-col gap-3.5">
        <DeltaControl
          label="Senior Dev"
          value={seniorDelta}
          onChange={updateSenior}
          options={[
            { label: "-1", value: -1 },
            { label: "0", value: 0 },
            { label: "+1", value: 1 },
          ]}
        />
        <DeltaControl
          label="Integrations"
          value={integrationsDelta}
          onChange={updateIntegrations}
          options={[
            { label: "-1", value: -1 },
            { label: "0", value: 0 },
            { label: "+1", value: 1 },
          ]}
        />
        <DeltaControl
          label="Deadline"
          value={deadlineDelta}
          onChange={updateDeadline}
          options={[
            { label: "-2w", value: -2 },
            { label: "0", value: 0 },
            { label: "+2w", value: 2 },
          ]}
        />
      </div>

      {/* Comparison summary */}
      {scenario && hasChanges && (
        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border/30 pt-4 animate-slide-up">
          <CompareMetric label="On-time" baseline={baseline.on_time_probability} current={scenario.on_time_probability} suffix="%" />
          <CompareMetric label="P50" baseline={baseline.p50_weeks} current={scenario.p50_weeks} suffix="w" invert />
          <CompareMetric label="P90" baseline={baseline.p90_weeks} current={scenario.p90_weeks} suffix="w" invert />
          <CompareMetric label="Overrun" baseline={baseline.expected_overrun_days} current={scenario.expected_overrun_days} suffix="d" invert />
        </div>
      )}
    </div>
  )
}

function CompareMetric({ label, baseline, current, suffix, invert = false }: { label: string; baseline: number; current: number; suffix: string; invert?: boolean }) {
  const diff = current - baseline
  const isGood = invert ? diff < 0 : diff > 0
  const color = Math.abs(diff) < 0.1 ? "text-muted-foreground" : isGood ? "text-success" : "text-destructive"

  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/25 px-3 py-2 ring-1 ring-border/20 transition-all duration-200 hover:bg-secondary/35">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] tabular-nums text-muted-foreground/70">{baseline.toFixed(1)}</span>
        <span className="text-muted-foreground/40">{"→"}</span>
        <span className={`text-[11px] font-medium tabular-nums ${color}`}>
          {current.toFixed(1)}{suffix}
        </span>
      </div>
    </div>
  )
}
