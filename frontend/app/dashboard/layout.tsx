import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - PlanSight",
  description: "Run Monte Carlo simulations on your project plan.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
