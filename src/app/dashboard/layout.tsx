import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
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
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderNav />

        {/* Main content area with history panel */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>

          {/* History Panel */}
          <HistoryPanelContainer />
        </div>
      </div>
    </div>
  )
}

