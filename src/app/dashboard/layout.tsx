"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { HistoryPanelContainer } from "@/components/history-panel-container"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

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

  // Prevent body scrolling when the app is loaded
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Navbar at the top */}
      <Navbar />

      {/* History Panel with slide animation */}
      <div
        className={`fixed top-0 left-0 h-full z-20 transition-all duration-300 ease-in-out ${
          isHistoryOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-72 md:relative md:block`}
        style={{ width: isHistoryOpen ? "100%" : "0", maxWidth: "300px" }}
        data-history-panel
      >
        <HistoryPanelContainer />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-14 transition-all duration-300 w-full h-full overflow-hidden">
        <div className="flex-1 overflow-hidden w-full h-full">{children}</div>
      </div>

      {/* Overlay for mobile when history panel is open */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsHistoryOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsHistoryOpen(false)
            }
          }}
          tabIndex={0}
          role="button"
        />
      )}
      <Footer />
    </div>
  )
}
