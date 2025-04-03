"use client"

import type React from "react"

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

      // In a real app, you would load the messages for this chat from a database
      // For now, we'll just simulate it with placeholder messages
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
            timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          },
        }),
      )
    }
  }, [messages, currentChatId])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput("") // Clear input immediately after submission

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
      // Focus the textarea after submission
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()

      // Add file message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Uploaded file: ${data.fileName}`,
          timestamp: new Date().toLocaleTimeString(),
          type: data.fileType.startsWith("image/") ? "image" : "text",
          mediaUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
        },
      ])

      // Use the correct toast API from sonner
      toast("File uploaded", {
        description: `${data.fileName} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      // Use the correct toast API from sonner
      toast.error("Upload failed", {
        description: "There was an error uploading your file.",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col h-full" ref={chatContainerRef}>
      {/* Messages area - fixed height, scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-4">
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
                  {message.type === "image" && message.mediaUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full aspect-square max-w-[600px]">
                        <Image
                          src={message.mediaUrl || "/placeholder.svg"}
                          alt={`Generated image for: ${message.content}`}
                          fill
                          className="rounded-md object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                          priority
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{message.content}</p>
                    </div>
                  ) : message.type === "video" && message.mediaUrl ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <video
                        src={message.mediaUrl}
                        controls
                        className="rounded-md max-w-full max-h-[300px]"
                        aria-label={`Generated video for prompt: ${message.content}`}
                      >
                        <track kind="captions" srcLang="en" src="/path-to-captions.vtt" label="English" default />
                      </video>
                    </div>
                  ) : message.fileType?.startsWith("image/") && message.mediaUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full aspect-square max-w-[600px]">
                        <Image
                          src={message.mediaUrl || "/placeholder.svg"}
                          alt={`Uploaded image: ${message.fileName || "file"}`}
                          fill
                          className="rounded-md object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                          priority
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{message.content}</p>
                    </div>
                  ) : message.fileType && message.mediaUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <File className="h-5 w-5" />
                        <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          {message.fileName || "Download file"}
                        </a>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
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

      {/* Input area - fixed at bottom */}
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
                onChange={handleFileUpload}
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

