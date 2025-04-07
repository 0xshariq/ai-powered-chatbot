"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, MessageSquare, Send, File, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { CodeBlock } from "@/components/code-block"
import { Footer } from "@/components/footer"

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
    className="text-left p-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors w-full"
  >
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </button>
)

export default function ChatInterface() {
  const [input, setInput] = useState("")
  const [, setGenerationType] = useState<GenerationType>("text")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>(uuidv4())
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showFilePreview, setShowFilePreview] = useState(false)
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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }

  const handleFeedback = async (messageId: string, feedbackType: FeedbackType) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          // Toggle feedback if clicking the same button
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

    const regexResult: RegExpExecArray | null = codeBlockRegex.exec(text);
    while (regexResult !== null) {
      codeBlocks.push({
        language: regexResult[1] || "text",
        code: regexResult[2].trim(),
      })
    }

    return codeBlocks
  }

  // Format message content with code blocks
  const formatMessageContent = (message: Message) => {
    if (!message.codeBlocks || message.codeBlocks.length === 0) {
      return <p className="whitespace-pre-wrap">{message.content}</p>
    }

    // Split content by code blocks
    const parts = []
    let lastIndex = 0
    const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g

    const regexResult = codeBlockRegex.exec(message.content);
    while (regexResult !== null) {
      // Add text before code block
      if (regexResult.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {message.content.substring(lastIndex, regexResult.index)}
          </p>,
        )
      }

      // Add code block
      const language = regexResult[1] || "text"
      const code = regexResult[2].trim()
      parts.push(<CodeBlock key={`code-${regexResult.index}`} language={language} code={code} />)

      lastIndex = regexResult.index + regexResult[0].length
    }

    // Add remaining text after last code block
    if (lastIndex < message.content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {message.content.substring(lastIndex)}
        </p>,
      )
    }

    return <>{parts}</>
  }

  // Detect generation type from input
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
    if ((!input.trim() && !selectedFile) || isLoading) return

    // If there's a selected file, upload it first
    if (selectedFile) {
      await handleFileSubmit()
      return
    }

    const currentInput = input
    const messageId = uuidv4()
    setInput("") // Clear input immediately after submission

    // Detect generation type from input
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

      // Detect code blocks in the response
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedFile(file)
    setShowFilePreview(true)
  }

  const handleCancelFile = () => {
    setSelectedFile(null)
    setShowFilePreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileSubmit = async () => {
    if (!selectedFile || isUploading) return

    setIsUploading(true)

    try {
      // Create FormData and append file
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("prompt", "Analyze this file and provide insights")

      // Send directly to analyzeFile endpoint
      const response = await fetch("/api/analyzeFile", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload and analysis failed")

      const data = await response.json()

      // Add file message to chat
      const fileMessageId = uuidv4()
      setMessages((prev) => [
        ...prev,
        {
          id: fileMessageId,
          role: "user",
          content: `Uploaded file: ${data.fileName}`,
          timestamp: new Date().toLocaleTimeString(),
          type: data.fileType.startsWith("image/") ? "image" : "text",
          mediaUrl: data.mediaUrl,
          fileType: data.fileType,
          fileName: data.fileName,
        },
      ])

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString(),
          type: "text",
        },
      ])

      // Use the correct toast API from sonner
      toast("File uploaded", {
        description: `${data.fileName} has been uploaded and analyzed.`,
      })
    } catch (error) {
      console.error("Error uploading and analyzing file:", error)
      toast.error("Upload failed", {
        description: "There was an error uploading and analyzing your file.",
      })
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      setShowFilePreview(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    // Focus the textarea after setting the input
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  return (
    <div className="flex flex-col h-full bg-black text-white" ref={chatContainerRef}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full py-4">
          <div className="max-w-3xl mx-auto space-y-8 pb-20 px-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={message.id || `${message.timestamp}-${index}`}
                  className={cn(
                    "w-full max-w-2xl mx-auto",
                    message.role === "user" ? "flex justify-end" : "flex justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-4 max-w-[90%]",
                      message.role === "user" ? "bg-gray-800" : "bg-gray-900",
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
                        <div className="relative w-full aspect-square max-w-[600px] mx-auto">
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
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full hover:bg-gray-800 flex items-center justify-center"
                          onClick={() => handleCopy(message.content)}
                          onKeyUp={(e) => e.key === "Enter" && handleCopy(message.content)}
                          aria-label="Copy message"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "h-8 w-8 rounded-full hover:bg-gray-800 flex items-center justify-center",
                            message.feedback === "liked" && "bg-green-600 hover:bg-green-700",
                          )}
                          onClick={() => handleFeedback(message.id, "liked")}
                          onKeyUp={(e) => e.key === "Enter" && handleFeedback(message.id, "liked")}
                          aria-label="Like message"
                          aria-pressed={message.feedback === "liked"}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "h-8 w-8 rounded-full hover:bg-gray-800 flex items-center justify-center",
                            message.feedback === "disliked" && "bg-red-600 hover:bg-red-700",
                          )}
                          onClick={() => handleFeedback(message.id, "disliked")}
                          onKeyUp={(e) => e.key === "Enter" && handleFeedback(message.id, "disliked")}
                          aria-label="Dislike message"
                          aria-pressed={message.feedback === "disliked"}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center w-full">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                <p className="text-gray-400 max-w-md">
                  Ask me anything or select a generation type to create text, images, or videos.
                </p>

                {/* Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto mt-8 px-4">
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
              <div className="flex justify-center w-full">
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

      {/* Input area - fixed at bottom */}
      <div className="p-2 sm:p-4 border-t border-gray-800 bg-black fixed bottom-0 left-0 right-0">
        <div className="max-w-2xl mx-auto w-full px-2">
          {showFilePreview && selectedFile && (
            <div className="mb-2 p-2 bg-gray-800 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <File className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCancelFile}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                  aria-label="Cancel file upload"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFileSubmit}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                  ) : null}
                  Upload
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask anything..."
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
                disabled={isLoading || (!input.trim() && !selectedFile)}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

