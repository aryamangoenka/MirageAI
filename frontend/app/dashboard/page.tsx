"use client"

import { AppProvider } from "@/lib/app-state"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { IntakeForm } from "@/components/dashboard/intake-form"
import { WhatIfPanel } from "@/components/dashboard/what-if-panel"
import { ResultsDashboard } from "@/components/dashboard/results-dashboard"
import { InsightPanels } from "@/components/dashboard/insight-panels"
import { ConversationalAdvisorWrapper } from "@/components/dashboard/advisor-wrapper"

export default function DashboardPage() {
  return (
    <AppProvider>
      <div className="min-h-screen ambient-bg">
        <DashboardNavbar />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left column */}
            <div className="flex w-full flex-col gap-6 lg:w-[38%] lg:min-w-[380px]">
              <IntakeForm />
              <WhatIfPanel />
            </div>
            {/* Right column */}
            <div className="w-full lg:w-[62%]">
              <ResultsDashboard />
            </div>
          </div>
        </main>
        <InsightPanels />
        <ConversationalAdvisorWrapper />
      </div>
    </AppProvider>
  )
}
