"use client"

import { useState } from "react"
import type { DistributionBucket } from "@/lib/types"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts"

interface Props {
  data: DistributionBucket[]
  baselineData?: DistributionBucket[]
  p50: number
  p90: number
}

export function DistributionChart({ data, baselineData, p50, p90 }: Props) {
  const [showOverlay, setShowOverlay] = useState(!!baselineData)

  // Merge data for overlay
  const merged = data.map((d) => {
    const baseMatch = baselineData?.find((b) => b.week === d.week)
    return {
      week: d.week,
      frequency: d.frequency,
      baseline: baseMatch?.frequency || 0,
    }
  })

  // Include baseline-only weeks
  if (baselineData) {
    baselineData.forEach((b) => {
      if (!merged.find((m) => m.week === b.week)) {
        merged.push({ week: b.week, frequency: 0, baseline: b.frequency })
      }
    })
    merged.sort((a, b) => a.week - b.week)
  }

  return (
    <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Timeline Distribution
        </h3>
        {baselineData && (
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              showOverlay ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Compare
          </button>
        )}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Weeks", position: "insideBottom", offset: -2, fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20, 20, 30, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
              }}
              labelFormatter={(label) => `Week ${label}`}
            />
            {showOverlay && baselineData && (
              <Area
                type="monotone"
                dataKey="baseline"
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
                strokeDasharray="4 4"
                name="Baseline"
                isAnimationActive={true}
                animationDuration={600}
              />
            )}
            <Bar
              dataKey="frequency"
              fill="var(--primary)"
              radius={[2, 2, 0, 0]}
              name={baselineData ? "Scenario" : "Frequency"}
              fillOpacity={0.75}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <ReferenceLine
              x={Math.round(p50)}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{ value: "P50", position: "top", fontSize: 10, fill: "rgba(255,255,255,0.6)" }}
            />
            <ReferenceLine
              x={Math.round(p90)}
              stroke="var(--destructive)"
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{ value: "P90", position: "top", fontSize: 10, fill: "var(--destructive)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
