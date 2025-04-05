"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, MessageSquare, Send, File, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { CodeBlock } from "@/components/code-block"

type GenerationType = "text" | "image" | "video"
type FeedbackType = "liked" | "disliked" | null

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
  type?: GenerationType
  mediaUrl?: string
  fileType?: string
  fileName?: string
  feedback?: FeedbackType
  codeBlocks?: Array<{
    language: string
    code: string
  }>
}

interface SuggestionProps {
  title: string
  description: string
  onClick: () => void
}

const Suggestion = ({ title, description, onClick }: SuggestionProps) => (
  <button
    type="button"
    onClick={onClick}
    onKeyUp={(e) => e.key === "Enter" && onClick()}
    className="text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors w-full"
  >
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </button>
)

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [, setGenerationType] = useState<GenerationType>("text")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>(uuidv4())
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    const handleSelectChat = (e: CustomEvent) => {
      const { chatId } = e.detail
      setCurrentChatId(chatId)
      setMessages([
        {
          id: uuidv4(),
          role: "user",
          content: `Selected chat ${chatId}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "text",
        },
        {
          id: uuidv4(),
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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }

  const handleFeedback = async (messageId: string, feedbackType: FeedbackType) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const newFeedback = msg.feedback === feedbackType ? null : feedbackType
          return { ...msg, feedback: newFeedback }
        }
        return msg
      }),
    )

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          feedback: feedbackType,
          chatId: currentChatId,
        }),
      })
    } catch (error) {
      console.error("Error sending feedback:", error)
    }
  }

  const detectCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g
    const codeBlocks = []
    const match = codeBlockRegex.exec(text)
    while (match !== null) {
      codeBlocks.push({
        language: match[1] || "text",
        code: match[2].trim(),
      })
    }
    return codeBlocks
  }

  const formatMessageContent = (message: Message) => {
    if (!message.codeBlocks || message.codeBlocks.length === 0) {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    }

    const parts = []
    let lastIndex = 0
    const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g
    const match = codeBlockRegex.exec(message.content)
    while (match !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {message.content.substring(lastIndex, match.index)}
          </p>,
        )
      }

      const language = match[1] || "text"
      const code = match[2].trim()
      parts.push(<CodeBlock key={`code-${match.index}`} language={language} code={code} />)

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < message.content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {message.content.substring(lastIndex)}
        </p>,
      )
    }

    return <>{parts}</>
  }

  const detectGenerationType = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (
      lowerInput.includes("generate image") ||
      lowerInput.includes("create image") ||
      lowerInput.includes("create an image") ||
      lowerInput.includes("generate an image") ||
      lowerInput.includes("make an image")
    ) {
      return "image"
    }

    if (
      lowerInput.includes("generate video") ||
      lowerInput.includes("create video") ||
      lowerInput.includes("create a video") ||
      lowerInput.includes("generate a video") ||
      lowerInput.includes("make a video")
    ) {
      return "video"
    }

    return "text"
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const currentInput = input
    const messageId = uuidv4()
    setInput("")

    const detectedType = detectGenerationType(currentInput)
    setGenerationType(detectedType)

    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: currentInput,
      timestamp: new Date().toLocaleTimeString(),
      type: detectedType,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const endpoint = `/api/generate${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput }),
      })

      if (!response.ok) throw new Error("Failed to generate response")

      const data = await response.json()
      const codeBlocks = detectCodeBlocks(data.text || "")

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.text || "Generated content",
          timestamp: new Date().toLocaleTimeString(),
          type: detectedType,
          mediaUrl: data.mediaUrl,
          codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
        },
      ])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
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

      const fileMessageId = uuidv4()
      setMessages((prev) => [
        ...prev,
        {
          id: fileMessageId,
          role: "user",
          content: `Uploaded file: ${data.fileName}`,
          timestamp: new Date().toLocaleTimeString(),
          type: data.fileType.startsWith("image/") ? "image" : "text",
          mediaUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
        },
      ])

      toast("File uploaded", {
        description: `${data.fileName} has been uploaded successfully.`,
      })

      try {
        const analysisResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileType: data.fileType,
            prompt: "Analyze this file and provide insights",
          }),
        })

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              content: analysisData.text,
              timestamp: new Date().toLocaleTimeString(),
              type: "text",
            },
          ])
        }
      } catch (analysisError) {
        console.error("Error analyzing file:", analysisError)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Upload failed", {
        description: "There was an error uploading your file.",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  return (
    <div className="flex flex-col h-full bg-black text-white" ref={chatContainerRef}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full py-4 px-4">
          <div className="w-full max-w-3xl mx-auto space-y-8 pb-20 px-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={message.id || `${message.timestamp}-${index}`} className="flex flex-col">
                  <div
                    className={cn(
                      "max-w-3xl rounded-lg p-4",
                      message.role === "user" ? "bg-gray-800" : "bg-transparent",
                    )}
                  >
                    {message.type === "image" && message.mediaUrl ? (
                      <div className="space-y-3">
                        <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                          <Image
                            src={message.mediaUrl || "/placeholder.svg"}
                            alt={`Generated image for: ${message.content}`}
                            fill
                            className="rounded-md object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 600px"
                            priority
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{message.content}</p>
                      </div>
                    ) : message.type === "video" && message.mediaUrl ? (
                      <div className="space-y-3">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <video
                          src={message.mediaUrl}
                          controls
                          className="rounded-md w-full max-w-full max-h-[300px] mx-auto"
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
                        <p className="text-sm text-gray-400 mt-2">{message.content}</p>
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
                    ) : message.codeBlocks && message.codeBlocks.length > 0 ? (
                      formatMessageContent(message)
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-4 text-gray-400">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-800"
                          onClick={() => handleCopy(message.content)}
                          onKeyUp={(e) => e.key === "Enter" && handleCopy(message.content)}
                          aria-label="Copy message"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={message.feedback === "liked" ? "default" : "ghost"}
                          size="icon"
                          className={cn(
                            "h-8 w-8 rounded-full hover:bg-gray-800",
                            message.feedback === "liked" && "bg-green-600 hover:bg-green-700",
                          )}
                          onClick={() => handleFeedback(message.id, "liked")}
                          onKeyUp={(e) => e.key === "Enter" && handleFeedback(message.id, "liked")}
                          aria-label="Like message"
                          aria-pressed={message.feedback === "liked"}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={message.feedback === "disliked" ? "default" : "ghost"}
                          size="icon"
                          className={cn(
                            "h-8 w-8 rounded-full hover:bg-gray-800",
                            message.feedback === "disliked" && "bg-red-600 hover:bg-red-700",
                          )}
                          onClick={() => handleFeedback(message.id, "disliked")}
                          onKeyUp={(e) => e.key === "Enter" && handleFeedback(message.id, "disliked")}
                          aria-label="Dislike message"
                          aria-pressed={message.feedback === "disliked"}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                <p className="text-gray-400 max-w-md">
                  Ask me anything or select a generation type to create text, images, or videos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto mt-8 px-4">
                  <Suggestion
                    title="What are the advantages"
                    description="of using Next.js?"
                    onClick={() => handleSuggestionClick("What are the advantages of using Next.js?")}
                  />
                  <Suggestion
                    title="Write code to"
                    description="demonstrate dijkstra's algorithm"
                    onClick={() => handleSuggestionClick("Write code to demonstrate dijkstra's algorithm")}
                  />
                  <Suggestion
                    title="Generate an image"
                    description="of a futuristic city"
                    onClick={() => handleSuggestionClick("Generate an image of a futuristic city")}
                  />
                  <Suggestion
                    title="Generate a code"
                    description="for a simple todo app"
                    onClick={() => handleSuggestionClick("Generate a code for a simple todo app")}
                  />
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
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

      <div className="p-2 sm:p-4 border-t border-gray-800 bg-black fixed bottom-0 left-0 right-0">
        <div className="max-w-3xl mx-auto w-full px-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 pr-16 resize-none bg-gray-900 border-gray-700 rounded-full pl-4 py-3 text-white w-full"
              rows={1}
            />
            <div className="absolute right-2 bottom-1.5 flex items-center">
              <button
                type="button"
                className="h-8 w-8 rounded-full hover:bg-gray-800 mr-1 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                onKeyUp={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Upload file"
              >
                {isUploading ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                className="h-8 w-8 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50"
                onClick={handleSubmit}
                onKeyUp={(e) => e.key === "Enter" && handleSubmit()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
          <div className="text-xs text-center text-gray-500 mt-2">© 2025 AI Image Generator. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}