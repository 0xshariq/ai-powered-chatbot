"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, Image, Video, MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    // Get current time
    const now = new Date()
    const timestamp = now.toLocaleTimeString()

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp,
      type: generationType,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call the appropriate API based on generationType
      const endpoint = `/api/generate${generationType.charAt(0).toUpperCase() + generationType.slice(1)}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate response")
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: data.text || "Generated content",
        timestamp: new Date().toLocaleTimeString(),
        type: generationType,
        mediaUrl: data.mediaUrl,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      }

      setMessages((prev) => [...prev, errorMessage])
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
      <ScrollArea className="flex-1 p-4">
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
                    <img
                      src={message.mediaUrl || "/placeholder.svg"}
                      alt="Generated image"
                      className="rounded-md max-w-full max-h-[300px] object-contain"
                    />
                  </div>
                ) : message.type === "video" && message.mediaUrl ? (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <video src={message.mediaUrl} controls className="rounded-md max-w-full max-h-[300px]" />
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
                  <Image className="h-4 w-4 mr-2" />
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

