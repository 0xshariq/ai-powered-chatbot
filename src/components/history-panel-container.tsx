"use client"

import { useState, useEffect } from "react"
import { HistoryPanel, type ChatHistory } from "@/components/history-panel"

export function HistoryPanelContainer() {
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

  // Fix the history panel logic by updating the handleSelectChat function
  const handleSelectChat = (id: string) => {
    setCurrentChatId(id)
  
    // Load the chat messages from localStorage
    const savedMessages = localStorage.getItem(`chat_messages_${id}`)
  
    if (savedMessages) {
      console.log(`Loaded messages for chat ID ${id}:`, JSON.parse(savedMessages))
    }
  
    // Dispatch event to notify ChatInterface to load this chat
    window.dispatchEvent(
      new CustomEvent("selectChat", {
        detail: {
          chatId: id,
        },
      }),
    )
  }

  const handleDeleteChat = (id: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id))

    // Remove chat messages from localStorage
    localStorage.removeItem(`chat_messages_${id}`)

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
        }
        return [
          ...prev,
          {
            id: chatId,
            title,
            preview,
            timestamp,
          },
        ]
      })

      setCurrentChatId(chatId)
    }

    window.addEventListener("chatUpdate", handleChatUpdate as EventListener)

    return () => {
      window.removeEventListener("chatUpdate", handleChatUpdate as EventListener)
    }
  }, [])

  return (
    <div className="h-full bg-gray-900 border-r border-gray-800">
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