"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { SimulationRequest, SimulationResponse, ExecutionPlanResponse, ExecutiveSummaryResponse } from "@/lib/types"
import { runSimulation, runScenario, fetchExecutionPlan, fetchExecutiveSummary } from "@/lib/api-client"
import { DEMO_FORM_DATA } from "@/lib/mock-data"
import { toast } from "sonner"

interface AppState {
  // Form
  formData: SimulationRequest
  setFormData: (data: SimulationRequest) => void
  loadDemo: () => void

  // Simulation
  baseline: SimulationResponse | null
  scenario: SimulationResponse | null
  isSimulating: boolean
  isScenarioRunning: boolean
  hasRun: boolean

  // Execution plan (fetched in background when simulation runs)
  executionPlan: ExecutionPlanResponse | null
  isExecutionPlanLoading: boolean
  executionPlanError: boolean
  regenerateExecutionPlan: () => Promise<void>

  // Executive summary (fetched in background when simulation runs)
  executiveSummary: ExecutiveSummaryResponse | null
  isExecutiveSummaryLoading: boolean
  executiveSummaryError: boolean
  regenerateExecutiveSummary: () => Promise<void>

  // Actions
  simulate: (data: SimulationRequest) => Promise<void>
  runScenarioAction: (seniorDelta: number, integrationsDelta: number, deadlineDelta: number) => Promise<void>

  // Panels
  activePanel: "failure" | "tasks" | "summary" | null
  setActivePanel: (panel: "failure" | "tasks" | "summary" | null) => void

  // Conversational Advisor
  showAdvisor: boolean
  setShowAdvisor: (show: boolean) => void
}

const AppContext = createContext<AppState | null>(null)

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppState must be used within AppProvider")
  return ctx
}

const defaultForm: SimulationRequest = {
  project_name: "",
  description: "",
  scope_size: "medium",
  complexity: 3,
  tech_stack: "React",
  deadline_weeks: 12,
  team_junior: 1,
  team_mid: 2,
  team_senior: 1,
  integrations_count: 2,
  scope_volatility: 30,
  num_simulations: 1000,
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<SimulationRequest>(defaultForm)
  const [baseline, setBaseline] = useState<SimulationResponse | null>(null)
  const [scenario, setScenario] = useState<SimulationResponse | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isScenarioRunning, setIsScenarioRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [activePanel, setActivePanel] = useState<"failure" | "tasks" | "summary" | null>(null)
  const [showAdvisor, setShowAdvisor] = useState(false)

  const [executionPlan, setExecutionPlan] = useState<ExecutionPlanResponse | null>(null)
  const [isExecutionPlanLoading, setIsExecutionPlanLoading] = useState(false)
  const [executionPlanError, setExecutionPlanError] = useState(false)

  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummaryResponse | null>(null)
  const [isExecutiveSummaryLoading, setIsExecutiveSummaryLoading] = useState(false)
  const [executiveSummaryError, setExecutiveSummaryError] = useState(false)

  const loadDemo = useCallback(() => {
    setFormData(DEMO_FORM_DATA)
  }, [])

  const startExecutiveSummaryFetch = useCallback((data: SimulationRequest, result: SimulationResponse) => {
    setExecutiveSummary(null)
    setExecutiveSummaryError(false)
    setIsExecutiveSummaryLoading(true)
    fetchExecutiveSummary(data, result)
      .then((summary) => setExecutiveSummary(summary))
      .catch(() => setExecutiveSummaryError(true))
      .finally(() => setIsExecutiveSummaryLoading(false))
  }, [])

  // Fires the Ollama call in the background — does not block the simulation UI
  const startExecutionPlanFetch = useCallback((data: SimulationRequest, result: SimulationResponse) => {
    setExecutionPlan(null)
    setExecutionPlanError(false)
    setIsExecutionPlanLoading(true)
    fetchExecutionPlan(data, result)
      .then((plan) => {
        setExecutionPlan(plan)
      })
      .catch(() => {
        setExecutionPlanError(true)
      })
      .finally(() => {
        setIsExecutionPlanLoading(false)
      })
  }, [])

  const simulate = useCallback(async (data: SimulationRequest) => {
    setIsSimulating(true)
    setScenario(null)
    try {
      const result = await runSimulation(data)
      setBaseline(result)
      setHasRun(true)
      // Fire background fetches immediately after simulation completes
      startExecutionPlanFetch(data, result)
      startExecutiveSummaryFetch(data, result)
    } catch {
      toast.error("Simulation failed", { description: "Please try again." })
    } finally {
      setIsSimulating(false)
    }
  }, [startExecutionPlanFetch, startExecutiveSummaryFetch])

  const runScenarioAction = useCallback(
    async (seniorDelta: number, integrationsDelta: number, deadlineDelta: number) => {
      if (!baseline) return
      setIsScenarioRunning(true)
      try {
        const result = await runScenario(baseline, seniorDelta, integrationsDelta, deadlineDelta)
        setScenario(result)
      } catch {
        toast.error("Scenario failed", { description: "Please try again." })
      } finally {
        setIsScenarioRunning(false)
      }
    },
    [baseline]
  )

  const regenerateExecutionPlan = useCallback(async () => {
    if (!baseline) return
    startExecutionPlanFetch(formData, baseline)
  }, [baseline, formData, startExecutionPlanFetch])

  const regenerateExecutiveSummary = useCallback(async () => {
    if (!baseline) return
    startExecutiveSummaryFetch(formData, baseline)
  }, [baseline, formData, startExecutiveSummaryFetch])

  return (
    <AppContext.Provider
      value={{
        formData,
        setFormData,
        loadDemo,
        baseline,
        scenario,
        isSimulating,
        isScenarioRunning,
        hasRun,
        executionPlan,
        isExecutionPlanLoading,
        executionPlanError,
        regenerateExecutionPlan,
        executiveSummary,
        isExecutiveSummaryLoading,
        executiveSummaryError,
        regenerateExecutiveSummary,
        simulate,
        runScenarioAction,
        activePanel,
        setActivePanel,
        showAdvisor,
        setShowAdvisor,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
