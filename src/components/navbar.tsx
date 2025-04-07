"use client"

import { Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-2 bg-black border-b border-gray-800">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
          className="text-white hover:bg-gray-700 active:bg-gray-600 flex items-center transition-colors rounded-md"
          data-history-toggle
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 mr-2" />
          <span>Toggle Sidebar</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700 active:bg-gray-600 flex items-center transition-colors rounded-md"
          onClick={() => window.dispatchEvent(new CustomEvent("newChat"))}
          onKeyUp={(e) => e.key === "Enter" && window.dispatchEvent(new CustomEvent("newChat"))}
          aria-label="New chat"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>New Chat</span>
        </Button>
      </div>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="text-white border-gray-700 bg-transparent hover:bg-gray-700 active:bg-gray-600 transition-colors rounded-md"
          aria-label="Login"
        >
          Login
        </Button>
      </div>
    </div>
  )
}

