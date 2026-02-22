"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Zap, Lightbulb, Check } from "lucide-react"
import { HeroVisual } from "@/components/landing/hero-visual"
import { useEffect, useRef, useState } from "react"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
    >
      {children}
    </a>
  )
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const { ref, isVisible } = useInView()
  return (
    <span ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      {value}{suffix}
    </span>
  )
}

export default function LandingPage() {
  const stats = useInView(0.2)
  const howItWorks = useInView(0.1)
  const features = useInView(0.1)
  const trust = useInView(0.2)
  const cta = useInView(0.2)

  return (
    <div className="min-h-screen ambient-bg">
      {/* Navbar */}
      <header className="animate-slide-down sticky top-0 z-50 border-b border-border/30 bg-background/50 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-base font-semibold tracking-tight text-foreground">
            PlanSight
          </span>
          <div className="hidden items-center gap-8 md:flex">
            <NavLink href="#product">Product</NavLink>
            <NavLink href="#how-it-works">How it Works</NavLink>
            <NavLink href="#features">Features</NavLink>
          </div>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 hover:shadow-primary/30 active:scale-95"
          >
            Launch Dashboard
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section id="product" className="relative overflow-hidden">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-20 pt-20 md:flex-row md:items-start md:gap-16 md:pt-32">
            {/* Left copy */}
            <div className="flex-1 pt-4">
              <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm ring-1 ring-border/20">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Predictive Project Intelligence
              </div>
              <h1 className="animate-blur-in text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl lg:leading-[1.08]">
                Simulate your project{"'"}s future before it fails.
              </h1>
              <p className="animate-slide-up delay-2 mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                Monte Carlo simulation for software timelines. See on-time probability, risk heatmaps, and what-if scenarios — all from a single input form.
              </p>
              <div className="animate-slide-up delay-4 mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 hover:shadow-primary/30 active:scale-[0.98]"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm ring-1 ring-border/20 transition-all duration-300 hover:bg-secondary/60 active:scale-[0.98]"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right visual */}
            <div className="flex flex-1 items-start justify-center md:justify-end animate-slide-in-right delay-3">
              <HeroVisual />
            </div>
          </div>

          {/* Ambient glow behind hero */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/4 blur-[140px]" />
        </section>

        {/* Stats strip */}
        <section ref={stats.ref} className="border-y border-border/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border/30 md:grid-cols-4">
            {[
              { value: "1,000+", label: "Simulations per run" },
              { value: "4", label: "Risk dimensions" },
              { value: "< 2s", label: "Analysis time" },
              { value: "P50/P90", label: "Confidence intervals" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`px-6 py-8 text-center transition-all duration-700 ${
                  stats.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" ref={howItWorks.ref} className="mx-auto max-w-6xl px-6 py-24">
          <div className={`mb-16 max-w-lg transition-all duration-700 ${howItWorks.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              How it works
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              From project parameters to probabilistic insight in three steps.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              {
                icon: Lightbulb,
                step: "01",
                title: "Intelligent Intake",
                description: "Define your project DNA: team, stack, deadline, complexity. The form captures everything the simulation needs.",
              },
              {
                icon: BarChart3,
                step: "02",
                title: "Monte Carlo Simulation",
                description: "1,000 parallel futures are computed, each modeling real-world variance in productivity, risk events, and scope creep.",
              },
              {
                icon: Zap,
                step: "03",
                title: "What-If Analysis",
                description: "Toggle team composition, deadline, or integrations and watch the probability curve shift in real time.",
              },
              {
                icon: Shield,
                step: "04",
                title: "Failure Forecast",
                description: "See the most likely failure sequence, get ordered mitigations, and export an executive summary.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`group glass-card p-5 transition-all duration-700 ${
                  howItWorks.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${200 + i * 120}ms` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/30">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground/60">{item.step}</span>
                </div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section id="features" ref={features.ref} className="border-t border-border/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className={`mb-16 max-w-lg transition-all duration-700 ${features.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Probabilistic, not vibes
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Every output is backed by statistical simulation. No arbitrary scoring, no magic numbers.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-border/30 bg-border/20 md:grid-cols-2">
              {[
                {
                  title: "Monte Carlo Distribution",
                  description: "Full histogram of completion timelines with P50/P90 markers. See the shape of uncertainty, not just a point estimate.",
                },
                {
                  title: "4-Axis Risk Heatmap",
                  description: "Integration complexity, team balance, scope creep, and learning curves scored independently with delay uplift projections.",
                },
                {
                  title: "Real-time What-If",
                  description: "Change one variable, re-simulate instantly. Debounced scenario engine shows baseline vs. scenario with animated deltas.",
                },
                {
                  title: "AI Task Blueprint",
                  description: "Dependency-ordered task breakdown with FE/BE/DevOps role chips and risk flags. Copy to clipboard in one click.",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`bg-card/40 p-8 backdrop-blur-sm transition-all duration-700 hover:bg-card/60 md:p-10 ${
                    features.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <h3 className="text-base font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section ref={trust.ref} className="border-t border-border/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                "Probabilistic, not vibes",
                "Explainable risk factors",
                "Built for leads & founders",
                "No account required",
              ].map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 transition-all duration-700 ${
                    trust.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section ref={cta.ref} className="border-t border-border/30">
          <div className={`mx-auto max-w-6xl px-6 py-24 text-center transition-all duration-700 ${
            cta.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Run a simulation in 30 seconds
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              No signup. No credit card. Enter your project parameters and get probability-based timeline predictions instantly.
            </p>
            <Link
              href="/dashboard"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 hover:shadow-primary/30 active:scale-[0.98]"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-sm text-muted-foreground/70">PlanSight</span>
          <div className="flex items-center gap-6">
            <a href="#product" className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground">Product</a>
            <a href="#how-it-works" className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground">How it Works</a>
            <a href="#features" className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
