"use client"

import { useEffect, useRef, useState } from "react"

export function CountUp({ value, decimals = 1, duration = 800, suffix = "", prefix = "" }: { value: number; decimals?: number; duration?: number; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState("0")
  const prevRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      setDisplay(current.toFixed(decimals))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(to.toFixed(decimals))
        prevRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, decimals, duration])

  return (
    <span>
      {prefix}{display}{suffix}
    </span>
  )
}
