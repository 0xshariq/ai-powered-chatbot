"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, ImageIcon, Video, MessageSquare, Send, Plus, File } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { v4 as uuidv4 } from "uuid"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"

type GenerationType = "text" | "image" | "video"

interface Message {
  role: "assistant" | "user"
  content: string
  timestamp: string
  type?: GenerationType
  mediaUrl?: string
  fileType?: string
  fileName?: string
  liked?: boolean
  disliked?: boolean
}

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [generationType, setGenerationType] = useState<GenerationType>("text")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>(uuidv4())
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  // Listen for chat selection events from the HistoryPanel
  useEffect(() => {
    const handleSelectChat = (e: CustomEvent) => {
      const { chatId } = e.detail
      setCurrentChatId(chatId)

      // Simulate loading messages for the selected chat
      setMessages([
        {
          role: "user",
          content: `Selected chat ${chatId}`,
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
      const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant")?.content || ""
      const title =
        messages[0]?.role === "user"
          ? messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? "..." : "")
          : "New Chat"
      const preview = lastAssistantMessage.slice(0, 40) + (lastAssistantMessage.length > 40 ? "..." : "")

      window.dispatchEvent(
        new CustomEvent("chatUpdate", {
          detail: {
            chatId: currentChatId,
            title,
            preview,
            timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          },
        }),
      )
    }
  }, [messages, currentChatId])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput("")

    const userMessage: Message = {
      role: "user",
      content: currentInput,
      timestamp: new Date().toLocaleTimeString(),
      type: generationType,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const endpoint = `/api/generate${generationType.charAt(0).toUpperCase() + generationType.slice(1)}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput }),
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
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast("Message copied to clipboard")
  }

  const handleLike = (index: number) => {
    setMessages((prev) =>
      prev.map((message, i) =>
        i === index ? { ...message, liked: !message.liked, disliked: false } : message,
      ),
    )
  }

  const handleDislike = (index: number) => {
    setMessages((prev) =>
      prev.map((message, i) =>
        i === index ? { ...message, disliked: !message.disliked, liked: false } : message,
      ),
    )
  }

  return (
    <div className="flex flex-col h-full" ref={chatContainerRef}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-muted-foreground/20">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={message.liked ? "default" : "ghost"}
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleLike(index)}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={message.disliked ? "default" : "ghost"}
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleDislike(index)}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-background">
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10" disabled={isUploading}>
                {isUploading ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="grid gap-1">
                <Button variant="ghost" className="justify-start" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload image
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => fileInputRef.current?.click()}>
                  <File className="mr-2 h-4 w-4" />
                  Upload file
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={() => {}}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </PopoverContent>
          </Popover>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything or describe what to generate..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 pr-10 resize-none"
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