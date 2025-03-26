"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, ImageIcon, Video, MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { v4 as uuidv4 } from "uuid"

type GenerationType = "text" | "image" | "video"

interface Message {
  role: "assistant" | "user"
  content: string
  timestamp: string
  type?: GenerationType
  mediaUrl?: string
}

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [generationType, setGenerationType] = useState<GenerationType>("text")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>(uuidv4())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Listen for chat selection events from the HistoryPanelContainer
  useEffect(() => {
    const handleSelectChat = (e: CustomEvent) => {
      const { chatId } = e.detail
      setCurrentChatId(chatId)

      // In a real app, you would load the messages for this chat from a database
      // For now, we'll just simulate it with placeholder messages
      setMessages([
        {
          role: "user",
          content: "Selected chat " + chatId,
          timestamp: new Date().toLocaleTimeString(),
          type: "text",
        },
        {
          role: "assistant",
          content:
            "This is a placeholder for the selected chat. In a real application, the actual chat messages would be loaded here.",
          timestamp: new Date().toLocaleTimeString(),
          type: "text",
        },
      ])
    }

    const handleNewChat = () => {
      setMessages([])
      setCurrentChatId(uuidv4())
    }

    window.addEventListener("selectChat", handleSelectChat as EventListener)
    window.addEventListener("newChat", handleNewChat)

    return () => {
      window.removeEventListener("selectChat", handleSelectChat as EventListener)
      window.removeEventListener("newChat", handleNewChat)
    }
  }, [])

  // Save chat to history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Get the last assistant message for the preview
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")?.content || ""

      // Generate a title from the first user message
      const title =
        messages[0]?.role === "user"
          ? messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? "..." : "")
          : "New Chat"

      // Create preview from the last exchange
      const preview = lastAssistantMessage.slice(0, 40) + (lastAssistantMessage.length > 40 ? "..." : "")

      // Update history via custom event
      window.dispatchEvent(
        new CustomEvent("chatUpdate", {
          detail: {
            chatId: currentChatId,
            title,
            preview,
            timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
          },
        }),
      )
    }
  }, [messages, currentChatId])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const now = new Date()
    const timestamp = now.toLocaleTimeString()

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp,
      type: generationType,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const endpoint = `/api/generate${generationType.charAt(0).toUpperCase() + generationType.slice(1)}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      })

      if (!response.ok) throw new Error("Failed to generate response")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text || "Generated content",
          timestamp: new Date().toLocaleTimeString(),
          type: generationType,
          mediaUrl: data.mediaUrl,
        },
      ])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request.",
          timestamp: new Date().toLocaleTimeString(),
          type: "text",
        },
      ])
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything or select a generation type to create text, images, or videos.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {message.type === "image" && message.mediaUrl ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="relative h-[300px] w-full">
                        <Image
                          src={message.mediaUrl || "/placeholder.svg"}
                          alt={`Generated image for prompt: ${message.content}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 600px"
                          className="rounded-md object-contain"
                        />
                      </div>
                    </div>
                  ) : message.type === "video" && message.mediaUrl ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <video
                        src={message.mediaUrl}
                        controls
                        className="rounded-md max-w-full max-h-[300px]"
                        aria-label={`Generated video for prompt: ${message.content}`}
                      />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-muted-foreground/20">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2 items-end">
          <Select value={generationType} onValueChange={(value) => setGenerationType(value as GenerationType)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Text" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Text
                </div>
              </SelectItem>
              <SelectItem value="image">
                <div className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </div>
              </SelectItem>
              <SelectItem value="video">
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 relative">
            <Textarea
              placeholder={`Ask me anything or describe what to generate...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 pr-10"
              rows={1}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 bottom-1.5 h-8 w-8"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

