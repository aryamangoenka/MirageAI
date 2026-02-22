'use client'

import { useEffect, useMemo, useRef } from 'react'
import { SimulationResponse, SimulationRequest, ExecutionPlanResponse } from '@/lib/types'

interface Props {
  simulation: SimulationResponse
  request: SimulationRequest
  executionPlan?: ExecutionPlanResponse | null
  onClose: () => void
}

// Helper function to build agent variables
function buildAgentVariables(
  request: SimulationRequest,
  simulation: SimulationResponse,
  executionPlan?: ExecutionPlanResponse | null,
) {
  const effectiveTeamSize = (
    request.team_junior * 0.7 +
    request.team_mid * 1.0 +
    request.team_senior * 1.3
  ).toFixed(1)

  const risks = [
    { name: 'Integration Risk', score: simulation.risks.integration_risk.score },
    { name: 'Team Imbalance Risk', score: simulation.risks.team_imbalance_risk.score },
    { name: 'Scope Creep Risk', score: simulation.risks.scope_creep_risk.score },
    { name: 'Learning Curve Risk', score: simulation.risks.learning_curve_risk.score },
  ]
  const topRisk = risks.reduce((max, r) => r.score > max.score ? r : max).name

  // ── Execution plan / task variables ─────────────────────────────────────
  let ui_task_list = 'No execution plan generated yet.'
  let ui_task_count = '0'
  let ui_task_roles = ''
  let ui_task_priorities = ''
  let ui_task_risk_tags = ''
  let ui_phase_count = '0'
  let ui_critical_path = ''
  let ui_go_no_go_checkpoints = ''

  if (executionPlan && executionPlan.phases?.length > 0) {
    const allTasks = executionPlan.phases.flatMap((phase) =>
      phase.tasks.map((task) => ({ ...task, phase: phase.name }))
    )

    // Format task list as a human-readable structured string the agent can reference
    const phaseLines = executionPlan.phases.map((phase) => {
      const taskLines = phase.tasks
        .map((t) => {
          const flag = t.risk_flag ? ` [${t.risk_flag}]` : ''
          return `  - [${t.role}, ${t.priority}] ${t.title}${flag}`
        })
        .join('\n')
      return `Phase: ${phase.name} (Week ${phase.week_start}–${phase.week_end})\nMilestone: ${phase.milestone}\nTasks:\n${taskLines}`
    })

    ui_task_list = phaseLines.join('\n\n')
    ui_task_count = allTasks.length.toString()
    ui_task_roles = [...new Set(allTasks.map((t) => t.role))].join(', ')
    ui_task_priorities = [...new Set(allTasks.map((t) => t.priority))].join(', ')
    ui_task_risk_tags = [
      ...new Set(allTasks.map((t) => t.risk_flag).filter(Boolean)),
    ].join(', ')
    ui_phase_count = executionPlan.phases.length.toString()
    ui_critical_path = executionPlan.critical_path_note || ''
    ui_go_no_go_checkpoints = executionPlan.go_no_go_checkpoints
      .map((cp) => `Week ${cp.week}: ${cp.condition}`)
      .join(' | ')
  }

  return {
    project_name: request.project_name,
    project_description: request.description,
    scope_size: request.scope_size,
    complexity_level: request.complexity.toString(),
    stack_type: request.tech_stack,
    deadline_weeks: request.deadline_weeks.toString(),
    team_juniors: request.team_junior.toString(),
    team_mids: request.team_mid.toString(),
    team_seniors: request.team_senior.toString(),
    effective_team_size: effectiveTeamSize,
    on_time_probability: simulation.on_time_probability.toString(),
    p50_weeks: simulation.p50_weeks.toString(),
    p90_weeks: simulation.p90_weeks.toString(),
    expected_overrun_weeks: (simulation.expected_overrun_days / 7).toFixed(1),
    num_simulations: simulation.num_simulations.toString(),
    integration_risk: simulation.risks.integration_risk.score.toString(),
    integration_risk_level: simulation.risks.integration_risk.level,
    integration_risk_delay: simulation.risks.integration_risk.delay_days.toString(),
    team_imbalance_risk: simulation.risks.team_imbalance_risk.score.toString(),
    team_imbalance_risk_level: simulation.risks.team_imbalance_risk.level,
    team_imbalance_risk_delay: simulation.risks.team_imbalance_risk.delay_days.toString(),
    scope_creep_risk: simulation.risks.scope_creep_risk.score.toString(),
    scope_creep_risk_level: simulation.risks.scope_creep_risk.level,
    scope_creep_risk_delay: simulation.risks.scope_creep_risk.delay_days.toString(),
    learning_curve_risk: simulation.risks.learning_curve_risk.score.toString(),
    learning_curve_risk_level: simulation.risks.learning_curve_risk.level,
    learning_curve_risk_delay: simulation.risks.learning_curve_risk.delay_days.toString(),
    top_risk: topRisk,
    team_stress_index: simulation.team_stress.score.toString(),
    team_stress_level: simulation.team_stress.label,
    team_stress_mitigation: simulation.team_stress.mitigation,
    p50_cost: simulation.p50_cost.toString(),
    p90_cost: simulation.p90_cost.toString(),
    currency: 'USD',
    allocation_frontend: Math.round(simulation.allocation.frontend_pct).toString(),
    allocation_backend: Math.round(simulation.allocation.backend_pct).toString(),
    allocation_devops: Math.round(simulation.allocation.devops_pct).toString(),
    integrations_count: request.integrations_count.toString(),
    scope_volatility: request.scope_volatility.toString(),
    // ── Execution plan task variables (synced from Ollama-generated UI content)
    ui_task_list,
    ui_task_count,
    ui_task_roles,
    ui_task_priorities,
    ui_task_risk_tags,
    ui_phase_count,
    ui_critical_path,
    ui_go_no_go_checkpoints,
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id': string
          'dynamic-variables'?: string
        },
        HTMLElement
      >
    }
  }
}

export function ConversationalAdvisor({ simulation, request, executionPlan, onClose }: Props) {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // Build agent variables — executionPlan tasks are included so the agent's
  // spoken output always matches what is displayed in the UI.
  const agentVariables = useMemo(
    () => buildAgentVariables(request, simulation, executionPlan),
    [request, simulation, executionPlan]
  )

  useEffect(() => {
    if (!agentId || agentId === 'your_agent_id_here' || initialized.current) return

    initialized.current = true

    // Load widget script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true

    script.onload = () => {
      console.log('ElevenLabs widget loaded with variables:', agentVariables)
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      initialized.current = false
    }
  }, [agentId, agentVariables])

  if (!agentId || agentId === 'your_agent_id_here') {
    return null
  }

  // Convert variables to JSON string for the widget
  const dynamicVariablesJson = JSON.stringify(agentVariables)

  return (
    <div ref={containerRef}>
      <elevenlabs-convai
        agent-id={agentId}
        dynamic-variables={dynamicVariablesJson}
      ></elevenlabs-convai>
    </div>
  )
}
