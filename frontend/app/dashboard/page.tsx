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
        <main className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left column - more breathing room */}
            <div className="flex w-full flex-col gap-6 lg:w-[340px] lg:min-w-[340px] lg:shrink-0">
              <div className="animate-slide-up delay-0">
                <IntakeForm />
              </div>
              <div className="animate-slide-up delay-2">
                <WhatIfPanel />
              </div>
            </div>
            {/* Right column - expands to fill */}
            <div className="w-full min-w-0 flex-1">
              <div className="animate-fade-in delay-1">
                <ResultsDashboard />
              </div>
            </div>
          </div>
        </main>
        <InsightPanels />
        <ConversationalAdvisorWrapper />
      </div>
    </AppProvider>
  )
}
