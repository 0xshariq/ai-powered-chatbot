"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

export interface ChatHistory {
  id: string
  title: string
  preview: string
  timestamp: string
}

interface HistoryPanelProps {
  history?: ChatHistory[]
  onSelectChat?: (id: string) => void
  onDeleteChat?: (id: string) => void
  onNewChat?: () => void
  currentChatId?: string
}

export function HistoryPanel({
  history = [],
  onSelectChat = () => {},
  onDeleteChat = () => {},
  onNewChat = () => {},
  currentChatId = "",
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(history)
  const [currentChatIdState, setCurrentChatId] = useState<string>(currentChatId)

  // Sync with localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory")
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory))
    }
    const savedCurrentChatId = localStorage.getItem("currentChatId")
    if (savedCurrentChatId) {
      setCurrentChatId(savedCurrentChatId)
    }
  }, [])

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  useEffect(() => {
    if (currentChatIdState) {
      localStorage.setItem("currentChatId", currentChatIdState)
    }
  }, [currentChatIdState])

  // Sync with props
  useEffect(() => {
    if (history.length > 0) {
      setChatHistory(history)
    }
  }, [history])

  useEffect(() => {
    if (currentChatId) {
      setCurrentChatId(currentChatId)
    }
  }, [currentChatId])

  // Event listener for chat updates
  useEffect(() => {
    const handleChatUpdate = (e: CustomEvent) => {
      const { chatId, title, preview, timestamp } = e.detail

      setChatHistory((prev) => {
        const existingIndex = prev.findIndex((chat) => chat.id === chatId)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = { ...updated[existingIndex], title, preview, timestamp }
          return updated
        }
        return [...prev, { id: chatId, title, preview, timestamp }]
      })

      setCurrentChatId(chatId)
    }

    window.addEventListener("chatUpdate", handleChatUpdate as EventListener)
    return () => window.removeEventListener("chatUpdate", handleChatUpdate as EventListener)
  }, [])

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id)
    onSelectChat(id)
  }

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id))
    onDeleteChat(id)
    if (currentChatIdState === id) {
      window.dispatchEvent(new CustomEvent("newChat"))
    }
  }

  const handleKeyDelete = (id: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation()
      setChatHistory((prev) => prev.filter((chat) => chat.id !== id))
      onDeleteChat(id)
      if (currentChatIdState === id) {
        window.dispatchEvent(new CustomEvent("newChat"))
      }
    }
  }

  const handleNewChat = () => {
    const newChatId = uuidv4()
    setCurrentChatId(newChatId)
    onNewChat()
  }

  const handleKeySelect = (id: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleSelectChat(id)
    }
  }

  const filteredHistory = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <div className="p-4 mt-14 flex items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search history..."
            className="pl-8 w-full bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          className="ml-2 text-gray-400 hover:text-white hover:bg-gray-800 h-9 w-9"
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 p-2">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={cn(
                  "w-full p-3 rounded-md text-left cursor-pointer group hover:bg-gray-800 transition-colors flex flex-col animate-fadeIn",
                  currentChatIdState === chat.id && "bg-gray-800",
                )}
                onClick={() => handleSelectChat(chat.id)}
                onKeyDown={(e) => handleKeySelect(chat.id, e)}
                aria-pressed={currentChatIdState === chat.id}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="font-medium truncate text-white flex-1">{chat.title}</div>
                  <button
                    type="button"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-gray-700 rounded flex items-center justify-center"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    onKeyDown={(e) => handleKeyDelete(chat.id, e)}
                    aria-label={`Delete chat ${chat.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-sm text-gray-400 truncate mt-1">{chat.preview}</div>
                <div className="text-xs text-gray-500 mt-2">{chat.timestamp}</div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? "No matching chats found" : "No chat history yet"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
