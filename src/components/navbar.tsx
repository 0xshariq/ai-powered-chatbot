"use client"

import { Menu, Plus, Github, Twitter, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-2 bg-black border-b border-gray-800">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
          className="text-white hover:bg-gray-700 active:bg-gray-600 transition-colors rounded-md h-9 w-9"
          data-history-toggle
          aria-label="History"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700 active:bg-gray-600 transition-colors rounded-md"
          onClick={() => window.dispatchEvent(new CustomEvent("newChat"))}
          aria-label="New chat"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>New Chat</span>
        </Button>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Link
            href="https://github.com/0xshariq"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Github"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://x.com/Sharique_Ch"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="https://www.instagram.com/sharique1303/"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/0xshariq/"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
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
