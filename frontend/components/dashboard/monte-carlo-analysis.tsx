'use client'

import { useState, useMemo } from 'react'
import type { DistributionBucket } from '@/lib/types'
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface Props {
  data: DistributionBucket[]
  p50: number
  p90: number
  deadline?: number
  numSimulations: number
}

export function MonteCarloAnalysis({ data, p50, p90, deadline, numSimulations }: Props) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'cdf'>('pdf')

  // Calculate statistics
  const stats = useMemo(() => {
    // Calculate weighted mean
    const totalCount = data.reduce((sum, d) => sum + d.frequency, 0)
    const mean = data.reduce((sum, d) => sum + d.week * d.frequency, 0) / totalCount

    // Calculate standard deviation
    const variance = data.reduce((sum, d) =>
      sum + Math.pow(d.week - mean, 2) * d.frequency, 0
    ) / totalCount
    const stdDev = Math.sqrt(variance)

    // Find mode (most frequent value)
    const mode = data.reduce((max, d) => d.frequency > max.frequency ? d : max).week

    // Calculate percentiles
    let cumulative = 0
    const percentiles: Record<number, number> = {}
    const sortedData = [...data].sort((a, b) => a.week - b.week)

    for (const d of sortedData) {
      cumulative += d.frequency
      const percentile = (cumulative / totalCount) * 100

      if (!percentiles[10] && percentile >= 10) percentiles[10] = d.week
      if (!percentiles[25] && percentile >= 25) percentiles[25] = d.week
      if (!percentiles[50] && percentile >= 50) percentiles[50] = d.week
      if (!percentiles[75] && percentile >= 75) percentiles[75] = d.week
      if (!percentiles[90] && percentile >= 90) percentiles[90] = d.week
      if (!percentiles[95] && percentile >= 95) percentiles[95] = d.week
    }

    // Calculate confidence intervals (95% CI)
    const ci95Lower = mean - 1.96 * stdDev
    const ci95Upper = mean + 1.96 * stdDev

    // Calculate skewness
    const skewness = data.reduce((sum, d) =>
      sum + Math.pow((d.week - mean) / stdDev, 3) * d.frequency, 0
    ) / totalCount

    return {
      mean,
      stdDev,
      mode,
      percentiles,
      ci95Lower,
      ci95Upper,
      skewness,
      totalCount,
    }
  }, [data])

  // Prepare CDF data
  const cdfData = useMemo(() => {
    let cumulative = 0
    return [...data]
      .sort((a, b) => a.week - b.week)
      .map(d => {
        cumulative += d.frequency
        return {
          week: d.week,
          frequency: d.frequency,
          cumulativeProbability: (cumulative / stats.totalCount) * 100,
          normalizedFrequency: (d.frequency / stats.totalCount) * 100,
        }
      })
  }, [data, stats.totalCount])

  // Generate normal distribution overlay
  const normalDistribution = useMemo(() => {
    const { mean, stdDev } = stats
    return cdfData.map(d => ({
      week: d.week,
      normal: (100 / (stdDev * Math.sqrt(2 * Math.PI))) *
              Math.exp(-0.5 * Math.pow((d.week - mean) / stdDev, 2)),
    }))
  }, [cdfData, stats])

  // Merge data for visualization
  const chartData = useMemo(() => {
    return cdfData.map((d, i) => ({
      ...d,
      normalDist: normalDistribution[i].normal,
    }))
  }, [cdfData, normalDistribution])

  return (
    <div className="glow-card rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monte Carlo Analysis
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {numSimulations.toLocaleString()} simulation runs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'pdf'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            PDF
          </button>
          <button
            onClick={() => setActiveTab('cdf')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'cdf'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            CDF
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <div className="rounded-lg bg-secondary/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground">Mean (μ)</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            {stats.mean.toFixed(1)}w
          </div>
        </div>
        <div className="rounded-lg bg-secondary/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground">Std Dev (σ)</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            {stats.stdDev.toFixed(1)}w
          </div>
        </div>
        <div className="rounded-lg bg-secondary/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground">Mode</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            {stats.mode}w
          </div>
        </div>
        <div className="rounded-lg bg-secondary/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground">Skewness</div>
          <div className="text-sm font-semibold tabular-nums text-foreground">
            {stats.skewness.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Confidence Interval */}
      <div className="mb-4 rounded-lg bg-secondary/20 px-3 py-2">
        <div className="text-[10px] text-muted-foreground mb-1">
          95% Confidence Interval
        </div>
        <div className="text-xs text-foreground">
          [{stats.ci95Lower.toFixed(1)}w, {stats.ci95Upper.toFixed(1)}w]
          <span className="ml-2 text-muted-foreground">
            (±{(1.96 * stats.stdDev).toFixed(1)}w from mean)
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'pdf' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              >
                <Label
                  value="Timeline (weeks)"
                  position="insideBottom"
                  offset={-10}
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                />
              </XAxis>
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              >
                <Label
                  value="Frequency (%)"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 30, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  backdropFilter: 'blur(12px)',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'normalizedFrequency') return [`${Number(value).toFixed(2)}%`, 'Observed']
                  if (name === 'normalDist') return [`${Number(value).toFixed(2)}%`, 'Normal Dist']
                  return [value, name]
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '10px' }}
                iconType="circle"
              />
              <Bar
                yAxisId="left"
                dataKey="normalizedFrequency"
                fill="var(--primary)"
                fillOpacity={0.7}
                radius={[3, 3, 0, 0]}
                name="Observed Distribution"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="normalDist"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Normal Distribution"
              />
              <ReferenceLine
                x={p50}
                yAxisId="left"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `P50: ${p50}w`,
                  position: 'top',
                  fontSize: 10,
                  fill: 'rgba(59, 130, 246, 1)',
                }}
              />
              <ReferenceLine
                x={p90}
                yAxisId="left"
                stroke="rgba(239, 68, 68, 0.8)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `P90: ${p90}w`,
                  position: 'top',
                  fontSize: 10,
                  fill: 'rgba(239, 68, 68, 1)',
                }}
              />
              {deadline && (
                <ReferenceLine
                  x={deadline}
                  yAxisId="left"
                  stroke="rgba(234, 179, 8, 0.8)"
                  strokeWidth={2}
                  label={{
                    value: `Deadline: ${deadline}w`,
                    position: 'top',
                    fontSize: 10,
                    fill: 'rgba(234, 179, 8, 1)',
                  }}
                />
              )}
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              >
                <Label
                  value="Timeline (weeks)"
                  position="insideBottom"
                  offset={-10}
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                />
              </XAxis>
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              >
                <Label
                  value="Cumulative Probability (%)"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 30, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  backdropFilter: 'blur(12px)',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Probability']}
              />
              <Area
                type="monotone"
                dataKey="cumulativeProbability"
                fill="var(--primary)"
                fillOpacity={0.3}
                stroke="var(--primary)"
                strokeWidth={3}
                name="Cumulative Distribution"
              />
              <ReferenceLine
                x={p50}
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `P50: ${p50}w (50%)`,
                  position: 'topRight',
                  fontSize: 10,
                  fill: 'rgba(59, 130, 246, 1)',
                }}
              />
              <ReferenceLine
                x={p90}
                stroke="rgba(239, 68, 68, 0.8)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `P90: ${p90}w (90%)`,
                  position: 'topRight',
                  fontSize: 10,
                  fill: 'rgba(239, 68, 68, 1)',
                }}
              />
              <ReferenceLine
                y={50}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="2 2"
                label={{
                  value: '50%',
                  position: 'left',
                  fontSize: 9,
                  fill: 'rgba(255,255,255,0.4)',
                }}
              />
              <ReferenceLine
                y={90}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="2 2"
                label={{
                  value: '90%',
                  position: 'left',
                  fontSize: 9,
                  fill: 'rgba(255,255,255,0.4)',
                }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Percentiles Table */}
      <div className="grid grid-cols-6 gap-2">
        {[10, 25, 50, 75, 90, 95].map(p => (
          <div key={p} className="rounded-lg bg-secondary/20 px-2 py-1.5 text-center">
            <div className="text-[9px] text-muted-foreground">P{p}</div>
            <div className="text-xs font-semibold tabular-nums text-foreground">
              {stats.percentiles[p]?.toFixed(1) || '-'}w
            </div>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="mt-4 rounded-lg bg-secondary/10 p-3">
        <div className="text-[10px] font-medium text-muted-foreground mb-1">
          Statistical Interpretation
        </div>
        <div className="text-xs text-foreground space-y-1">
          <div>
            • <strong>{stats.percentiles[50]?.toFixed(1)}w</strong> median completion
            (50% chance of finishing earlier)
          </div>
          <div>
            • <strong>{stats.percentiles[90]?.toFixed(1)}w</strong> pessimistic estimate
            (90% confidence level)
          </div>
          <div>
            • Distribution is {Math.abs(stats.skewness) < 0.5 ? 'symmetric' : stats.skewness > 0 ? 'right-skewed (longer tail)' : 'left-skewed'}
          </div>
          {deadline && (
            <div className={deadline < p90 ? 'text-destructive' : 'text-success'}>
              • Deadline at {deadline}w has{' '}
              {chartData.find(d => d.week >= deadline)?.cumulativeProbability.toFixed(0)}%
              confidence
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
