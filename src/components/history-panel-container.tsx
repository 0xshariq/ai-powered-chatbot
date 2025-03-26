"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HistoryPanel, type ChatHistory } from "@/components/history-panel"
import { History, X } from "lucide-react"

export function HistoryPanelContainer() {
  const [showHistory, setShowHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>("")

  // Load chat history from localStorage on component mount
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

  // Save chat history to localStorage when it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Save current chat ID to localStorage when it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("currentChatId", currentChatId)
    }
  }, [currentChatId])

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id)
    // Dispatch event to notify ChatInterface to load this chat
    window.dispatchEvent(new CustomEvent("selectChat", { detail: { chatId: id } }))
  }

  const handleDeleteChat = (id: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id))
    if (currentChatId === id) {
      // If the current chat is deleted, create a new chat
      window.dispatchEvent(new CustomEvent("newChat"))
    }
  }

  const handleNewChat = () => {
    window.dispatchEvent(new CustomEvent("newChat"))
  }

  // Listen for chat updates from the ChatInterface component
  useEffect(() => {
    const handleChatUpdate = (e: CustomEvent) => {
      const { chatId, title, preview, timestamp } = e.detail

      setChatHistory((prev) => {
        const existingChatIndex = prev.findIndex((chat) => chat.id === chatId)

        if (existingChatIndex >= 0) {
          const updatedHistory = [...prev]
          updatedHistory[existingChatIndex] = {
            ...updatedHistory[existingChatIndex],
            title,
            preview,
            timestamp,
          }
          return updatedHistory
        } else {
          return [
            ...prev,
            {
              id: chatId,
              title,
              preview,
              timestamp,
            },
          ]
        }
      })

      setCurrentChatId(chatId)
    }

    window.addEventListener("chatUpdate", handleChatUpdate as EventListener)

    return () => {
      window.removeEventListener("chatUpdate", handleChatUpdate as EventListener)
    }
  }, [])

  if (!showHistory) {
    return (
      <div className="fixed bottom-20 right-6 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setShowHistory(true)}
          aria-label="Show chat history"
        >
          <History className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowHistory(false)}
          aria-label="Hide chat history"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <HistoryPanel
        history={chatHistory}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
      />
    </div>
  )
}

