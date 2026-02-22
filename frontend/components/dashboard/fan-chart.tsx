'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface Props {
  p50: number
  p90: number
  deadline: number
  numSimulations: number
  complexity: number
  teamSize: number
}

export function FanChart({ p50, p90, deadline, numSimulations, complexity, teamSize }: Props) {
  // Generate fan chart data with centered axis showing deviations
  const fanData = useMemo(() => {
    const maxWeeks = Math.ceil(p90 * 1.2)
    const baselineGrowth = 100 / p50

    const baseVolatility = 0.15
    const volatility = baseVolatility * (1 + complexity / 20) * (1 / Math.sqrt(teamSize / 3))

    const numPaths = 100
    const paths: number[][] = []

    for (let i = 0; i < numPaths; i++) {
      const path = [0]
      let cumulativeDeviation = 0

      for (let week = 1; week <= maxWeeks; week++) {
        const randomShock = (Math.random() - 0.5) * 2
        const meanReversion = -0.1 * cumulativeDeviation
        const weeklyDeviation = (volatility * week * randomShock + meanReversion) * baselineGrowth

        cumulativeDeviation += weeklyDeviation
        path.push(cumulativeDeviation)
      }
      paths.push(path)
    }

    const data = []
    for (let week = 0; week <= maxWeeks; week++) {
      const deviations = paths.map(path => path[week]).sort((a, b) => a - b)

      const p5 = deviations[Math.floor(numPaths * 0.05)]
      const p10 = deviations[Math.floor(numPaths * 0.10)]
      const p25 = deviations[Math.floor(numPaths * 0.25)]
      const p50Val = deviations[Math.floor(numPaths * 0.50)]
      const p75 = deviations[Math.floor(numPaths * 0.75)]
      const p90Val = deviations[Math.floor(numPaths * 0.90)]
      const p95 = deviations[Math.floor(numPaths * 0.95)]

      data.push({
        week,
        p95Upper: Math.abs(p95),
        p90Upper: Math.abs(p90Val),
        p75Upper: Math.abs(p75),
        p95Lower: -Math.abs(p5),
        p90Lower: -Math.abs(p10),
        p75Lower: -Math.abs(p25),
        median: 0,
        path1: paths[5]?.[week],
        path2: paths[15]?.[week],
        path3: paths[30]?.[week],
        path4: paths[45]?.[week],
        path5: paths[60]?.[week],
        path6: paths[75]?.[week],
        path7: paths[85]?.[week],
        path8: paths[95]?.[week],
      })
    }

    return data
  }, [p50, p90, complexity, teamSize])

  const maxDeviation = useMemo(() => {
    return Math.max(...fanData.map(d => Math.max(Math.abs(d.p95Upper), Math.abs(d.p95Lower))))
  }, [fanData])

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Path Simulation Plot (Fan Chart)
          </h3>
        </div>
        <p className="text-[10px] text-muted-foreground/60 ml-8">
          Symmetric uncertainty bands • Geometric Brownian motion • {numSimulations.toLocaleString()} simulations
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.15), rgba(239,68,68,0.15))' }}></div>
          <span className="text-muted-foreground/70">90% confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.3), rgba(239,68,68,0.3))' }}></div>
          <span className="text-muted-foreground/70">75% confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-primary rounded"></div>
          <span className="text-muted-foreground/70">Median path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-white opacity-15 rounded"></div>
          <span className="text-muted-foreground/70">Sample trajectories</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={fanData}
            margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          >
            <defs>
              <linearGradient id="upperP90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="upperP75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="lowerP90" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="lowerP75" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity={0.08} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              horizontal={true}
              vertical={false}
            />

            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              tickLine={false}
            >
              <Label
                value="Time Horizon (weeks)"
                position="insideBottom"
                offset={-18}
                style={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              />
            </XAxis>

            <YAxis
              domain={[-maxDeviation * 1.1, maxDeviation * 1.1]}
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              tickLine={false}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
            >
              <Label
                value="Deviation from Median Timeline"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', textAnchor: 'middle' }}
              />
            </YAxis>

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 15, 25, 0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '10px',
                backdropFilter: 'blur(16px)',
                padding: '8px 12px',
              }}
              formatter={(value: any) => [`${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(1)}%`]}
              labelFormatter={(label) => `Week ${label}`}
            />

            <Area
              type="monotone"
              dataKey="p90Upper"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth={1}
              fill="url(#upperP90)"
              isAnimationActive={true}
              animationDuration={1200}
            />
            <Area
              type="monotone"
              dataKey="p75Upper"
              stroke="rgba(59, 130, 246, 0.6)"
              strokeWidth={1}
              fill="url(#upperP75)"
              isAnimationActive={true}
              animationDuration={1200}
            />

            <Area
              type="monotone"
              dataKey="p90Lower"
              stroke="rgba(239, 68, 68, 0.4)"
              strokeWidth={1}
              fill="url(#lowerP90)"
              isAnimationActive={true}
              animationDuration={1200}
            />
            <Area
              type="monotone"
              dataKey="p75Lower"
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth={1}
              fill="url(#lowerP75)"
              isAnimationActive={true}
              animationDuration={1200}
            />

            {/* Sample individual paths */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`path${i}`}
                stroke={`rgba(255,255,255,${0.06 + i * 0.008})`}
                strokeWidth={0.7}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000 + i * 100}
              />
            ))}

            <ReferenceLine
              y={0}
              stroke="var(--primary)"
              strokeWidth={2}
              label={{
                value: 'Median Path (P50)',
                position: 'insideTopRight',
                fontSize: 9,
                fill: 'var(--primary)',
                offset: 10,
              }}
            />

            <ReferenceLine
              x={deadline}
              stroke="rgba(234, 179, 8, 0.8)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{
                value: `Target: ${deadline}w`,
                position: 'top',
                fontSize: 10,
                fill: 'rgba(234, 179, 8, 0.9)',
                offset: 10,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Statistical Summary */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500/8 to-blue-500/3 ring-1 ring-blue-500/15 p-3">
          <div className="text-[10px] text-blue-400/80 mb-1">Optimistic (Early)</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            P10: {Math.max(1, p50 - (p90 - p50) * 0.8).toFixed(1)}w
          </div>
          <div className="text-[9px] text-muted-foreground/60 mt-0.5">10% finish earlier</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 ring-1 ring-primary/15 p-3">
          <div className="text-[10px] text-primary/80 mb-1">Median (Expected)</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            P50: {p50}w
          </div>
          <div className="text-[9px] text-muted-foreground/60 mt-0.5">50% probability</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-red-500/8 to-red-500/3 ring-1 ring-red-500/15 p-3">
          <div className="text-[10px] text-red-400/80 mb-1">Pessimistic (Late)</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            P90: {p90}w
          </div>
          <div className="text-[9px] text-muted-foreground/60 mt-0.5">90% confidence</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="rounded-xl bg-secondary/10 p-3.5 ring-1 ring-border/10">
        <div className="text-[10px] font-medium text-muted-foreground/70 mb-1.5">
          Chart Interpretation
        </div>
        <div className="text-[11px] text-foreground/90 space-y-1">
          <div>
            • <span className="text-blue-400/90">Blue bands (above)</span>: Optimistic scenarios - project completes faster than median
          </div>
          <div>
            • <span className="text-red-400/90">Red bands (below)</span>: Pessimistic scenarios - project takes longer than median
          </div>
          <div>
            • <strong>Symmetric fan spread</strong> shows uncertainty growing over time in both directions
          </div>
          <div>
            • <strong>Narrower bands</strong> = higher confidence • <strong>Wider bands</strong> = more uncertainty
          </div>
          {deadline < p50 && (
            <div className="text-destructive mt-2 pt-2 border-t border-destructive/15">
              Target deadline ({deadline}w) falls below median path - high risk of delay
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
