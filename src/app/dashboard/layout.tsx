"use client"

import type React from "react"

import { useState } from "react"
import { HeaderNav } from "@/components/header-nav"
import { Footer } from "@/components/footer"
import { HistoryPanel } from "@/components/history-panel"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* History Panel with toggle */}
      <div className={`border-r bg-muted/10 transition-all duration-300 flex ${isHistoryOpen ? "w-64" : "w-0"}`}>
        {isHistoryOpen && (
          <HistoryPanel
            history={[]} // Replace with actual history data
            onSelectChat={(chatId) => console.log("Selected chat:", chatId)} // Replace with actual handler
            onDeleteChat={(chatId) => console.log("Deleted chat:", chatId)} // Replace with actual handler
            onNewChat={() => console.log("New chat created")} // Replace with actual handler
            currentChatId="" // Replace with actual current chat ID
          />
        )}
      </div>

      {/* Toggle button for history panel */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background border border-r-0 rounded-l-md rounded-r-none h-12 w-6"
      >
        {isHistoryOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderNav />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

