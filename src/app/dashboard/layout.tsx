"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { HistoryPanel } from "@/components/history-panel"
import { Menu, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Toggle sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        isHistoryOpen &&
        window.innerWidth < 768 &&
        !target.closest("[data-history-panel]") &&
        !target.closest("[data-history-toggle]")
      ) {
        setIsHistoryOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isHistoryOpen])

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Header with toggle button */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center p-2 bg-black border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="text-white hover:bg-gray-800"
            data-history-toggle
          >
            {isHistoryOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            className="text-white hover:bg-gray-800"
            onClick={() => window.dispatchEvent(new CustomEvent("newChat"))}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="ml-auto">
          <Button variant="outline" className="text-white border-gray-700 bg-transparent hover:bg-gray-800">
            Login
          </Button>
        </div>
      </div>

      {/* History Panel with slide animation */}
      <div
        className={`fixed top-0 left-0 h-full z-10 transition-transform duration-300 ease-in-out transform ${
          isHistoryOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative`}
        data-history-panel
      >
        <div className="h-full w-72 bg-gray-900 border-r border-gray-800">
          <div className="pt-14">
            <HistoryPanel
              history={[]}
              onSelectChat={() => {}}
              onDeleteChat={() => {}}
              onNewChat={() => {}}
              currentChatId=""
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col pt-14 transition-all duration-300 ${isHistoryOpen ? "md:ml-72" : ""}`}>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

