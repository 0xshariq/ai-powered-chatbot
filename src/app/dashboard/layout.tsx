import type React from "react"
import { HeaderNav } from "@/components/header-nav"
import { Footer } from "@/components/footer"
import { HistoryPanelContainer } from "@/components/history-panel-container"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* History Panel (replacing sidebar) */}
      <HistoryPanelContainer />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderNav />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

