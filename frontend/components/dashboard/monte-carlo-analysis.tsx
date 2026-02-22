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
import { BarChart3, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  data: DistributionBucket[]
  p50: number
  p90: number
  deadline?: number
  numSimulations: number
}

const PERCENTILE_LABELS: Record<number, string> = {
  10: 'Best',
  25: 'Good',
  50: 'Expected',
  75: 'Likely',
  90: 'Plan for',
  95: 'Worst',
}

export function MonteCarloAnalysis({ data, p50, p90, deadline, numSimulations }: Props) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'cdf'>('pdf')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const stats = useMemo(() => {
    const totalCount = data.reduce((sum, d) => sum + d.frequency, 0)
    const mean = data.reduce((sum, d) => sum + d.week * d.frequency, 0) / totalCount
    const variance =
      data.reduce((sum, d) => sum + Math.pow(d.week - mean, 2) * d.frequency, 0) / totalCount
    const stdDev = Math.sqrt(variance)
    const mode = data.reduce((max, d) => (d.frequency > max.frequency ? d : max)).week

    let cumulative = 0
    const percentiles: Record<number, number> = {}
    const sortedData = [...data].sort((a, b) => a.week - b.week)

    for (const d of sortedData) {
      cumulative += d.frequency
      const pct = (cumulative / totalCount) * 100
      if (!percentiles[10] && pct >= 10) percentiles[10] = d.week
      if (!percentiles[25] && pct >= 25) percentiles[25] = d.week
      if (!percentiles[50] && pct >= 50) percentiles[50] = d.week
      if (!percentiles[75] && pct >= 75) percentiles[75] = d.week
      if (!percentiles[90] && pct >= 90) percentiles[90] = d.week
      if (!percentiles[95] && pct >= 95) percentiles[95] = d.week
    }

    const ci95Lower = mean - 1.96 * stdDev
    const ci95Upper = mean + 1.96 * stdDev
    const skewness =
      data.reduce((sum, d) => sum + Math.pow((d.week - mean) / stdDev, 3) * d.frequency, 0) /
      totalCount

    return { mean, stdDev, mode, percentiles, ci95Lower, ci95Upper, skewness, totalCount }
  }, [data])

  const cdfData = useMemo(() => {
    let cumulative = 0
    return [...data]
      .sort((a, b) => a.week - b.week)
      .map((d) => {
        cumulative += d.frequency
        return {
          week: d.week,
          frequency: d.frequency,
          cumulativeProbability: (cumulative / stats.totalCount) * 100,
          normalizedFrequency: (d.frequency / stats.totalCount) * 100,
        }
      })
  }, [data, stats.totalCount])

  const normalDistribution = useMemo(() => {
    const { mean, stdDev } = stats
    return cdfData.map((d) => ({
      week: d.week,
      normal:
        (100 / (stdDev * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((d.week - mean) / stdDev, 2)),
    }))
  }, [cdfData, stats])

  const chartData = useMemo(
    () => cdfData.map((d, i) => ({ ...d, normalDist: normalDistribution[i].normal })),
    [cdfData, normalDistribution]
  )

  const deadlineConfidence = deadline
    ? chartData.find((d) => d.week >= deadline)?.cumulativeProbability
    : undefined

  const insightText = (() => {
    const base = `Based on ${numSimulations.toLocaleString()} test scenarios, you're most likely to finish around week ${p50}. There's a 90% chance you'll be done by week ${p90}.`
    if (!deadline) return base
    const conf = deadlineConfidence?.toFixed(0)
    const isRisky = deadline < p90
    return `${base} Your target deadline (week ${deadline}) has a ${conf}% confidence — ${
      isRisky ? 'consider adding buffer time.' : 'you should be fine.'
    }`
  })()

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    fontSize: '11px',
    backdropFilter: 'blur(16px)',
    padding: '8px 12px',
  }

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Completion Probability
            </h3>
            <p className="mt-0.5 text-[10px] text-muted-foreground/60">
              {numSimulations.toLocaleString()} scenarios tested
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl border border-border/40 bg-secondary/20 p-0.5">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              activeTab === 'pdf'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            Frequency
          </button>
          <button
            onClick={() => setActiveTab('cdf')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              activeTab === 'cdf'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            Confidence
          </button>
        </div>
      </div>

      {/* Plain-language insight */}
      <div className="insight-callout mb-4 p-3.5 animate-fade-in">
        <p className="text-[12px] leading-relaxed text-foreground/90">{insightText}</p>
        {deadline && deadlineConfidence !== undefined && (
          <div
            className={`mt-2 text-[11px] font-medium ${
              deadline < p90 ? 'text-destructive' : 'text-success'
            }`}
          >
            {deadline < p90
              ? `⚠️ Deadline is tighter than your 90th percentile — high delay risk.`
              : `✓ Deadline is comfortably within your expected range.`}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'pdf' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              >
                <Label
                  value="Timeline (weeks)"
                  position="insideBottom"
                  offset={-10}
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                />
              </XAxis>
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              >
                <Label
                  value="How often (%)"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                />
              </YAxis>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, name: string) => {
                  if (name === 'normalizedFrequency') return [`${Number(value).toFixed(2)}%`, 'Scenarios']
                  if (name === 'normalDist') return [`${Number(value).toFixed(2)}%`, 'Trend curve']
                  return [value, name]
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
              <Bar
                yAxisId="left"
                dataKey="normalizedFrequency"
                fill="var(--primary)"
                fillOpacity={0.6}
                radius={[4, 4, 0, 0]}
                name="Scenario Frequency"
                isAnimationActive={true}
                animationDuration={800}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="normalDist"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name="Trend Curve"
              />
              <ReferenceLine
                x={p50}
                yAxisId="left"
                stroke="rgba(59, 130, 246, 0.7)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: `Expected: ${p50}w`, position: 'top', fontSize: 10, fill: 'rgba(59, 130, 246, 0.9)' }}
              />
              <ReferenceLine
                x={p90}
                yAxisId="left"
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: `Worst case: ${p90}w`, position: 'top', fontSize: 10, fill: 'rgba(239, 68, 68, 0.9)' }}
              />
              {deadline && (
                <ReferenceLine
                  x={deadline}
                  yAxisId="left"
                  stroke="rgba(234, 179, 8, 0.7)"
                  strokeWidth={1.5}
                  label={{ value: `Your deadline: ${deadline}w`, position: 'top', fontSize: 10, fill: 'rgba(234, 179, 8, 0.9)' }}
                />
              )}
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              >
                <Label
                  value="Timeline (weeks)"
                  position="insideBottom"
                  offset={-10}
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                />
              </XAxis>
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              >
                <Label
                  value="Chance of completing by this week (%)"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                />
              </YAxis>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Chance done']}
              />
              <Area
                type="monotone"
                dataKey="cumulativeProbability"
                fill="var(--primary)"
                fillOpacity={0.2}
                stroke="var(--primary)"
                strokeWidth={2.5}
                name="Cumulative Confidence"
              />
              <ReferenceLine
                x={p50}
                stroke="rgba(59, 130, 246, 0.7)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: `Expected: ${p50}w (50%)`, position: 'top', fontSize: 10, fill: 'rgba(59, 130, 246, 0.9)' }}
              />
              <ReferenceLine
                x={p90}
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: `Worst: ${p90}w (90%)`, position: 'top', fontSize: 10, fill: 'rgba(239, 68, 68, 0.9)' }}
              />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" label={{ value: '50%', position: 'left', fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} />
              <ReferenceLine y={90} stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" label={{ value: '90%', position: 'left', fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Friendly percentile table */}
      <div className="mb-4 grid grid-cols-6 gap-1.5">
        {[10, 25, 50, 75, 90, 95].map((p, i) => (
          <div
            key={p}
            className={`animate-scale-in rounded-xl px-2 py-1.5 text-center ring-1 ring-border/10 ${
              p === 50
                ? 'bg-primary/15 ring-primary/25'
                : p === 90
                ? 'bg-destructive/10 ring-destructive/15'
                : 'bg-secondary/15'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="text-[9px] font-medium text-muted-foreground/70">
              {PERCENTILE_LABELS[p]}
            </div>
            <div className="text-[11px] font-semibold tabular-nums text-foreground">
              {stats.percentiles[p]?.toFixed(1) || '-'}w
            </div>
          </div>
        ))}
      </div>

      {/* Advanced accordion */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl bg-secondary/20 px-3 py-2 text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/30 hover:text-foreground"
      >
        <span>Advanced statistics</span>
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showAdvanced && (
        <div className="mt-2 flex flex-col gap-2 animate-slide-up">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Mean (μ)', value: `${stats.mean.toFixed(1)}w` },
              { label: 'Std Dev (σ)', value: `${stats.stdDev.toFixed(1)}w` },
              { label: 'Mode', value: `${stats.mode}w` },
              { label: 'Skewness', value: stats.skewness.toFixed(2) },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="animate-scale-in rounded-xl bg-secondary/20 px-3 py-2 ring-1 ring-border/20"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-[10px] text-muted-foreground/70">{stat.label}</div>
                <div className="text-sm font-semibold tabular-nums text-foreground">{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-secondary/15 px-3 py-2.5 ring-1 ring-border/15">
            <div className="text-[10px] text-muted-foreground/70 mb-1">95% Confidence Interval</div>
            <div className="text-[11px] text-foreground">
              [{stats.ci95Lower.toFixed(1)}w, {stats.ci95Upper.toFixed(1)}w]
              <span className="ml-2 text-muted-foreground/60">
                (±{(1.96 * stats.stdDev).toFixed(1)}w from mean)
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/10 px-3 py-2.5 ring-1 ring-border/10 text-[11px] text-foreground/80 space-y-1">
            <div>• Distribution is {Math.abs(stats.skewness) < 0.5 ? 'symmetric' : stats.skewness > 0 ? 'right-skewed (longer tail on late side)' : 'left-skewed'}</div>
            {deadline && (
              <div className={deadline < p90 ? 'text-destructive' : 'text-success'}>
                • Deadline at {deadline}w: {deadlineConfidence?.toFixed(0)}% confidence
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
