"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, Clock, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChatHistory {
  id: string
  title: string
  preview: string
  timestamp: string
}

interface HistoryPanelProps {
  history: ChatHistory[]
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onNewChat: () => void
  currentChatId?: string
}

export function HistoryPanel({ history, onSelectChat, onDeleteChat, onNewChat, currentChatId }: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredHistory = history.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-80 border-l">
      <div className="h-14 border-b px-4 flex items-center justify-between">
        <h2 className="font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Chat History
        </h2>
        <Button variant="ghost" size="sm" onClick={onNewChat}>
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
                <div
                  key={chat.id}
                  className={cn(
                    "p-3 rounded-md cursor-pointer group hover:bg-muted/50 transition-colors",
                    currentChatId === chat.id && "bg-muted",
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">{chat.title}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-1">{chat.preview}</div>
                  <div className="text-xs text-muted-foreground mt-2">{chat.timestamp}</div>
                </div>
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

