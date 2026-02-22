"use client"

import { useState } from "react"
import { useAppState } from "@/lib/app-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Play, Sparkles, Loader2 } from "lucide-react"
import type { SimulationRequest } from "@/lib/types"

const SCOPE_OPTIONS = ["small", "medium", "large"] as const
const COMPLEXITY_LABELS = ["Low", "Medium-Low", "Medium", "Medium-High", "High"]
const TECH_STACKS = ["React", "Next.js", "React Native", "Node.js", "Python/FastAPI", "Go", "Ruby on Rails"]

function Stepper({ value, onChange, min = 0, max = 10, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-sm text-foreground transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 hover:text-primary active:scale-95"
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-medium tabular-nums text-foreground">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-sm text-foreground transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 hover:text-primary active:scale-95"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function IntakeForm() {
  const { formData, setFormData, simulate, isSimulating, loadDemo } = useAppState()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update<K extends keyof SimulationRequest>(key: K, value: SimulationRequest[K]) {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      const next = { ...errors }
      delete next[key]
      setErrors(next)
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!formData.project_name.trim()) e.project_name = "Required"
    if (formData.deadline_weeks < 1) e.deadline_weeks = "Must be at least 1"
    if (formData.team_junior + formData.team_mid + formData.team_senior < 1) e.team = "Need at least 1 team member"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    simulate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Project DNA</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Define your project parameters</p>
        </div>
        <button
          type="button"
          onClick={loadDemo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 active:scale-95"
        >
          <Sparkles className="h-3 w-3" />
          Demo
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Project name */}
        <div>
          <Label htmlFor="project_name" className="text-[11px] font-medium text-muted-foreground">Project Name</Label>
          <Input
            id="project_name"
            value={formData.project_name}
            onChange={(e) => update("project_name", e.target.value)}
            placeholder="e.g. FinTrack Mobile App"
            className="mt-1.5 bg-secondary/30 border-border/40 transition-all duration-200 focus:border-primary/40 focus:bg-secondary/50"
          />
          {errors.project_name && <p className="mt-1 text-[11px] text-destructive animate-slide-up">{errors.project_name}</p>}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-[11px] font-medium text-muted-foreground">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Brief project overview..."
            rows={2}
            className="mt-1.5 resize-none bg-secondary/30 border-border/40 transition-all duration-200 focus:border-primary/40 focus:bg-secondary/50"
          />
        </div>

        {/* Scope size */}
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Scope Size</Label>
          <div className="mt-1.5 flex rounded-xl border border-border/40 bg-secondary/20 p-0.5">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => update("scope_size", opt)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-[11px] font-medium capitalize transition-all duration-300 ${
                  formData.scope_size === opt
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-muted-foreground">Complexity</Label>
            <span className="text-[11px] font-medium text-foreground">{COMPLEXITY_LABELS[formData.complexity - 1]}</span>
          </div>
          <Slider
            value={[formData.complexity]}
            onValueChange={([v]) => update("complexity", v)}
            min={1}
            max={5}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Tech stack */}
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Tech Stack</Label>
          <Select value={formData.tech_stack} onValueChange={(v) => update("tech_stack", v)}>
            <SelectTrigger className="mt-1.5 w-full bg-secondary/30 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TECH_STACKS.map((stack) => (
                <SelectItem key={stack} value={stack}>{stack}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deadline */}
        <div>
          <Label htmlFor="deadline" className="text-[11px] font-medium text-muted-foreground">Deadline (weeks)</Label>
          <Input
            id="deadline"
            type="number"
            min={1}
            max={104}
            value={formData.deadline_weeks}
            onChange={(e) => update("deadline_weeks", parseInt(e.target.value) || 1)}
            className="mt-1.5 bg-secondary/30 border-border/40 transition-all duration-200 focus:border-primary/40 focus:bg-secondary/50"
          />
          {errors.deadline_weeks && <p className="mt-1 text-[11px] text-destructive animate-slide-up">{errors.deadline_weeks}</p>}
        </div>

        {/* Team composition */}
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground">Team Composition</Label>
          <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border/30 bg-secondary/15 p-3">
            <Stepper label="Junior" value={formData.team_junior} onChange={(v) => update("team_junior", v)} />
            <Stepper label="Mid-level" value={formData.team_mid} onChange={(v) => update("team_mid", v)} />
            <Stepper label="Senior" value={formData.team_senior} onChange={(v) => update("team_senior", v)} />
          </div>
          {errors.team && <p className="mt-1 text-[11px] text-destructive animate-slide-up">{errors.team}</p>}
        </div>

        {/* Integrations */}
        <Stepper label="Integrations" value={formData.integrations_count} onChange={(v) => update("integrations_count", v)} max={6} />

        {/* Scope volatility */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-medium text-muted-foreground">Scope Volatility</Label>
            <span className="text-[11px] font-medium tabular-nums text-foreground">{formData.scope_volatility}%</span>
          </div>
          <Slider
            value={[formData.scope_volatility]}
            onValueChange={([v]) => update("scope_volatility", v)}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
          <p className="mt-1 text-[10px] text-muted-foreground/70">Higher = more likely requirements change</p>
        </div>

        {/* Advanced */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger className="flex w-full items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`} />
            Advanced
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div>
              <Label htmlFor="num_sims" className="text-[11px] font-medium text-muted-foreground">Simulations</Label>
              <Input
                id="num_sims"
                type="number"
                min={100}
                max={10000}
                step={100}
                value={formData.num_simulations}
                onChange={(e) => update("num_simulations", parseInt(e.target.value) || 1000)}
                className="mt-1.5 bg-secondary/30 border-border/40"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSimulating}
          className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60 disabled:shadow-none disabled:active:scale-100"
        >
          {isSimulating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running {formData.num_simulations?.toLocaleString()} simulations...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              Run Simulation
            </>
          )}
        </button>
      </div>
    </form>
  )
}
