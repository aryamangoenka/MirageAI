"use client"

import { useEffect, useState, useRef } from "react"

// Animated probability curve preview card for the hero section
export function HeroVisual() {
  const [mounted, setMounted] = useState(false)
  const [probability, setProbability] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
    // Count up probability
    let frame = 0
    const target = 42
    const duration = 60 // frames
    const interval = setInterval(() => {
      frame++
      const progress = Math.min(frame / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setProbability(Math.round(target * eased))
      if (frame >= duration) clearInterval(interval)
    }, 25)
    return () => clearInterval(interval)
  }, [])

  // Draw the histogram
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mounted) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    let progress = 0
    const drawDuration = 80

    function draw() {
      if (!ctx) return
      progress++
      const p = Math.min(progress / drawDuration, 1)
      const easedP = 1 - Math.pow(1 - p, 3)

      ctx.clearRect(0, 0, w, h)

      // Generate distribution data
      const mean = 14
      const stdDev = 3.5
      const buckets: number[] = []
      for (let i = 4; i <= 26; i++) {
        const z = (i - mean) / stdDev
        buckets.push(Math.exp(-0.5 * z * z))
      }
      const maxVal = Math.max(...buckets)

      // Draw bars
      const barCount = buckets.length
      const barWidth = (w - 40) / barCount
      const barGap = 2
      const baseY = h - 24

      buckets.forEach((val, i) => {
        const barH = (val / maxVal) * (h - 50) * easedP
        const x = 20 + i * barWidth
        const y = baseY - barH

        // Bar gradient
        const grad = ctx.createLinearGradient(x, y, x, baseY)
        grad.addColorStop(0, "rgba(56, 189, 248, 0.7)")
        grad.addColorStop(1, "rgba(56, 189, 248, 0.1)")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(x + barGap / 2, y, barWidth - barGap, barH, [3, 3, 0, 0])
        ctx.fill()
      })

      // P50 line
      const p50X = 20 + 10 * barWidth + barWidth / 2
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)"
      ctx.lineWidth = 1
      ctx.moveTo(p50X, 12)
      ctx.lineTo(p50X, baseY)
      ctx.stroke()
      ctx.setLineDash([])

      // P50 label
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = "10px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("P50", p50X, 10)

      // P90 line
      const p90X = 20 + 16 * barWidth + barWidth / 2
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = "rgba(248, 113, 113, 0.5)"
      ctx.lineWidth = 1
      ctx.moveTo(p90X, 12)
      ctx.lineTo(p90X, baseY)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = "rgba(248, 113, 113, 0.6)"
      ctx.fillText("P90", p90X, 10)

      // X-axis label
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
      ctx.font = "9px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Completion Timeline (weeks)", w / 2, h - 4)

      if (p < 1) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [mounted])

  if (!mounted) {
    return <div className="h-[280px] w-full rounded-2xl border border-border/30 bg-card/40" />
  }

  return (
    <div className="relative w-full max-w-md glass-card p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">Monte Carlo Simulation</span>
        </div>
        <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground/80 ring-1 ring-border/20">
          1,000 runs
        </span>
      </div>

      {/* Big metric */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums tracking-tight text-primary">
          {probability}%
        </span>
        <span className="text-sm text-muted-foreground">On-Time Probability</span>
      </div>

      {/* Mini metrics */}
      <div className="mb-4 flex gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/60">P50</span>
          <span className="text-sm font-medium tabular-nums text-foreground">14.2w</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/60">P90</span>
          <span className="text-sm font-medium tabular-nums text-foreground">21.7w</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground/60">Overrun</span>
          <span className="text-sm font-medium tabular-nums text-destructive">+18d</span>
        </div>
      </div>

      {/* Canvas chart */}
      <canvas
        ref={canvasRef}
        className="h-[140px] w-full"
        style={{ display: "block" }}
      />

      {/* Subtle glow accent at top */}
      <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  )
}
