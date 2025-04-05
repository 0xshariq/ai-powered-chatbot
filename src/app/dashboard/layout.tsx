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

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isHistoryOpen) {
        setIsHistoryOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isHistoryOpen])

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Header with toggle button */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center p-2 bg-black border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            onKeyUp={(e) => e.key === "Enter" && setIsHistoryOpen(!isHistoryOpen)}
            className="text-white hover:bg-gray-800 flex items-center"
            data-history-toggle
            aria-label={isHistoryOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isHistoryOpen}
          >
            {isHistoryOpen ? <X className="h-5 w-5 mr-2" /> : <Menu className="h-5 w-5 mr-2" />}
            <span className="hidden sm:inline">{isHistoryOpen ? "Close Sidebar" : "Toggle Sidebar"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800 flex items-center"
            onClick={() => window.dispatchEvent(new CustomEvent("newChat"))}
            onKeyUp={(e) => e.key === "Enter" && window.dispatchEvent(new CustomEvent("newChat"))}
            aria-label="New chat"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-white border-gray-700 bg-transparent hover:bg-gray-800"
            aria-label="Login"
          >
            Login
          </Button>
        </div>
      </div>

      {/* History Panel with slide animation */}
      <div
        className={`fixed top-0 left-0 h-full z-10 transition-all duration-300 ease-in-out ${
          isHistoryOpen ? "translate-x-0 w-full sm:w-72" : "-translate-x-full w-0"
        } md:translate-x-0 md:w-72 md:relative md:block`}
        data-history-panel
      >
        <div className="h-full w-full bg-gray-900 border-r border-gray-800">
          <div className="pt-14">
            <HistoryPanel />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-14 transition-all duration-300 w-full">
        <div className="flex-1 overflow-hidden w-full">{children}</div>
      </div>
    </div>
  )
}

