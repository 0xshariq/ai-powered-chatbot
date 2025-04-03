"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, Clock, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

export interface ChatHistory {
  id: string
  title: string
  preview: string
  timestamp: string
}


interface HistoryPanelProps {
  history: ChatHistory[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
  currentChatId: string;
}

export function HistoryPanel({
  history,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  currentChatId,
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(history) // Use the `history` prop to initialize chatHistory
  const [currentChatIdState, setCurrentChatId] = useState<string>(currentChatId) // Use the `currentChatId` prop to initialize state

  // Update the current chat ID when the prop changes
  useEffect(() => {
    setCurrentChatId(currentChatId)
  }, [currentChatId])

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id)
    onSelectChat(id) // Use the `onSelectChat` prop
    window.dispatchEvent(new CustomEvent("selectChat", { detail: { chatId: id } }))
  }

  const handleDeleteChat = (id: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id))
    onDeleteChat(id) // Use the `onDeleteChat` prop
    if (currentChatId === id) {
      window.dispatchEvent(new CustomEvent("newChat"))
    }
  }

  const handleNewChat = () => {
    const newChatId = uuidv4()
    setCurrentChatId(newChatId)
    onNewChat() // Use the `onNewChat` prop
    window.dispatchEvent(new CustomEvent("newChat"))
  }

  const filteredHistory = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-14 border-b px-4 flex items-center justify-between">
        <h2 className="font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Chat History
        </h2>
        <Button variant="ghost" size="sm" onClick={handleNewChat}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search history..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-2">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={cn(
                    "p-3 rounded-md cursor-pointer group hover:bg-muted/50 transition-colors text-left",
                    currentChatIdState === chat.id && "bg-muted", // Use `currentChatIdState`
                  )}
                  onClick={() => handleSelectChat(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleSelectChat(chat.id)
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">{chat.title}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChat(chat.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-1">{chat.preview}</div>
                  <div className="text-xs text-muted-foreground mt-2">{chat.timestamp}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No matching chats found" : "No chat history yet"}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}