"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { HistoryPanel } from "@/components/history-panel"
import { Navbar } from "@/components/navbar"

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

  // Listen for toggle sidebar event
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsHistoryOpen((prev) => !prev)
    }

    window.addEventListener("toggleSidebar", handleToggleSidebar)
    return () => {
      window.removeEventListener("toggleSidebar", handleToggleSidebar)
    }
  }, [])

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Header with toggle button */}
      <Navbar />

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

