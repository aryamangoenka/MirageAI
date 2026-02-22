'use client'

import { useAppState } from "@/lib/app-state"
import { ConversationalAdvisor } from "@/components/ConversationalAdvisor"

export function ConversationalAdvisorWrapper() {
  const { showAdvisor, setShowAdvisor, baseline, formData } = useAppState()

  if (!showAdvisor || !baseline) return null

  return (
    <ConversationalAdvisor
      simulation={baseline}
      request={formData}
      onClose={() => setShowAdvisor(false)}
    />
  )
}
