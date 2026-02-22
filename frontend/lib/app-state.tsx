"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { SimulationRequest, SimulationResponse } from "@/lib/types"
import { runSimulation, runScenario } from "@/lib/api-client"
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

  const loadDemo = useCallback(() => {
    setFormData(DEMO_FORM_DATA)
  }, [])

  const simulate = useCallback(async (data: SimulationRequest) => {
    setIsSimulating(true)
    setScenario(null)
    try {
      const result = await runSimulation(data)
      setBaseline(result)
      setHasRun(true)
      // Removed success toast - simulation results speak for themselves
    } catch {
      toast.error("Simulation failed", { description: "Please try again." })
    } finally {
      setIsSimulating(false)
    }
  }, [])

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
