import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { HeaderNav } from "@/components/header-nav"
import { DetailsPanel } from "@/components/details-panel"
import { Footer } from "@/components/footer"

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
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <HeaderNav />

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </div>

        {/* Right Panel */}
        <DetailsPanel />
      </div>
    </div>
  )
}

