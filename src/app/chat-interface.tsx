"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, MessageSquare, Send, File, Paperclip, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { CodeResponse } from "@/components/code-response"
import { Footer } from "@/components/footer"
import { Separator } from "@/components/ui/separator"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type GenerationType = "text" | "image" | "video" | "code"
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
  languageSections?: Array<{
    language: string
    content: string
  }>
  isStructured?: boolean
}

interface SuggestionProps {
  title: string
  description: string
  onClick: () => void
}

const Suggestion = ({ title, description, onClick }: SuggestionProps) => (
  <Button
    type="button"
    onClick={onClick}
    onKeyUp={(e) => e.key === "Enter" && onClick()}
    className="text-left p-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors w-full hover:shadow-md animate-fadeIn"
  >
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </Button>
)

// Define suggestions array
const SUGGESTIONS = [
  {
    title: "What are the advantages",
    description: "of using Next.js?",
    prompt: "What are the advantages of using Next.js?",
  },
  {
    title: "Write code to",
    description: "demonstrate dijkstra's algorithm",
    prompt: "Write code to demonstrate dijkstra's algorithm",
  },
  {
    title: "Generate an image",
    description: "of a futuristic city",
    prompt: "Generate an image of a futuristic city",
  },
  {
    title: "Tell me about",
    description: "artificial intelligence",
    prompt: "Tell me about artificial intelligence",
  },
  {
    title: "Explain the concept",
    description: "of blockchain technology",
    prompt: "Explain the concept of blockchain technology",
  },
  {
    title: "How do I implement",
    description: "authentication in Next.js?",
    prompt: "How do I implement authentication in Next.js?",
  },
]

// Update the generateChatId function to use the new-chat format
function generateChatId() {
  // Create a base string with the prefix
  const baseString = "new-chat-"

  // Generate a random string of 8-10 characters (mix of letters and numbers)
  const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase()

  // Combine them
  return `${baseString}${randomChars}`
}

interface ChatInterfaceProps {
  initialChatId?: string
}

export default function ChatInterface({ initialChatId }: ChatInterfaceProps = {}) {
  const [input, setInput] = useState("")
  const [, setGenerationType] = useState<GenerationType>("text")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>(initialChatId || "")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [randomSuggestions, setRandomSuggestions] = useState<typeof SUGGESTIONS>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Randomize suggestions on component mount
  useEffect(() => {
    const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random())
    setRandomSuggestions(shuffled.slice(0, 4))
  }, [])

  // Load messages for the current chat ID on initial render
  useEffect(() => {
    if (initialChatId) {
      setCurrentChatId(initialChatId)
      const savedMessages = localStorage.getItem(`chat_messages_${initialChatId}`)
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages))
        } catch (e) {
          console.error("Failed to parse saved messages:", e)
          setMessages([])
        }
      }

      // Update URL if not already on the correct path
      if (pathname !== `/chat/${initialChatId}`) {
        router.push(`/chat/${initialChatId}`, { scroll: false })
      }
    }
  }, [initialChatId, pathname, router])

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      localStorage.setItem(`chat_messages_${currentChatId}`, JSON.stringify(messages))
    }
  }, [messages, currentChatId])

  // Listen for chat selection events from the HistoryPanel
  useEffect(() => {
    const handleSelectChat = (e: CustomEvent) => {
      try {
        const { chatId } = e.detail
        console.log("Received selectChat event for chatId:", chatId)

        if (!chatId) {
          console.error("No chatId provided in selectChat event")
          return
        }

        setCurrentChatId(chatId)

        // Navigate to the selected chat
        router.push(`/chat/${chatId}`)

        // Load the messages for this chat
        const savedMessages = localStorage.getItem(`chat_messages_${chatId}`)
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages))
        } else {
          // If no messages found, create an empty chat
          setMessages([])
        }
      } catch (error) {
        console.error("Error handling selectChat event:", error)
      }
    }

    // Update the event listener for newChat
    const handleNewChat = () => {
      try {
        setMessages([])
        setCurrentChatId("")
        router.push("/dashboard")
      } catch (error) {
        console.error("Error handling newChat event:", error)
      }
    }

    window.addEventListener("selectChat", handleSelectChat as EventListener)
    window.addEventListener("newChat", handleNewChat)

    return () => {
      window.removeEventListener("selectChat", handleSelectChat as EventListener)
      window.removeEventListener("newChat", handleNewChat)
    }
  }, [router])

  // Save chat to history when messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      try {
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
      } catch (error) {
        console.error("Error updating chat history:", error)
      }
    }
  }, [messages, currentChatId])

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content)
    setCopied(messageId)
    setTimeout(() => setCopied(null), 2000)
    toast.success("Copied to clipboard")
  }

  const handleFeedback = async (messageId: string, feedbackType: FeedbackType) => {
    if (!currentChatId) return

    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          // Toggle feedback if clicking the same Button
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

  // Format structured text with numbered points and sections
  const formatStructuredText = (content: string) => {
    const parts: React.ReactNode[] = []
    const lines = content.split("\n")
    let currentSection: string[] = []
    let sectionIndex = 0

    for (const line of lines) {
      // Check if this is a numbered point (e.g., "1. Something")
      const isNumberedPoint = /^\d+\.\s+/.test(line)
    
      // Check if this is a heading (e.g., "Blockchain Technology:")
      const isHeading = /^[A-Z][^:]+:/.test(line)
    
      if (isNumberedPoint || isHeading) {
        // If we have accumulated content in the current section, add it
        if (currentSection.length > 0) {
          parts.push(
            <div key={`section-${sectionIndex}`} className="mb-4">
              {currentSection.map((text) => (
                <p key={`p-${sectionIndex}-${text}`} className="whitespace-pre-wrap">
                  {text}
                </p>
              ))}
            </div>,
          )
          currentSection = []
          sectionIndex++
        }
    
        // Add separator if not the first item
        if (parts.length > 0) {
          parts.push(<Separator key={`sep-${uuidv4()}`} className="my-4 bg-gray-700" />)
        }
    
        // Add the numbered point or heading with appropriate styling
        if (isNumberedPoint) {
          parts.push(
            <div key={`point-${uuidv4()}`} className="mb-2 animate-fadeIn">
              <p className="font-semibold">{line}</p>
            </div>,
          )
        } else if (isHeading) {
          parts.push(
            <div key={`heading-${uuidv4()}`} className="mb-2 animate-fadeIn">
              <h3 className="font-semibold text-lg">{line}</h3>
            </div>,
          )
        }
      } else if (line.trim() === "") {
        // Empty line - if we have content, add it as a paragraph
        if (currentSection.length > 0) {
          parts.push(
            <div key={`section-${sectionIndex}`} className="mb-4">
              {currentSection.map((text) => (
                <p key={`p-${sectionIndex}-${text}`} className="whitespace-pre-wrap">
                  {text}
                </p>
              ))}
            </div>,
          )
          currentSection = []
          sectionIndex++
        }
      } else {
        // Regular line - add to current section
        currentSection.push(line)
      }
    }

    // Add any remaining content
    if (currentSection.length > 0) {
      parts.push(
        <div key={`section-${sectionIndex}`} className="mb-4">
          {currentSection.map((text) => (
            <p key={`p-${sectionIndex}-${text}`} className="whitespace-pre-wrap">
              {text}
            </p>
          ))}
        </div>,
      )
    }

    return <div className="space-y-2">{parts}</div>
  }

  // Format message content based on type and structure
  const formatMessageContent = (message: Message) => {
    // For code type messages with code blocks
    if (message.type === "code" && message.codeBlocks && message.codeBlocks.length > 0) {
      return (
        <CodeResponse
          text={message.content}
          codeBlocks={message.codeBlocks}
          languageSections={message.languageSections}
        />
      )
    }
    // For structured text responses (explanations)
    if (message.type === "text" && message.isStructured) {
      return formatStructuredText(message.content)
    }
    // For regular text messages
      return <p className="whitespace-pre-wrap">{message.content}</p>
  }

  // Detect generation type from input
  const detectGenerationType = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (
      lowerInput.includes("generate image") ||
      lowerInput.includes("create image") ||
      lowerInput.includes("create an image") ||
      lowerInput.includes("generate an image") ||
      lowerInput.includes("make an image") ||
      lowerInput.includes("draw") ||
      lowerInput.includes("picture of")
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

    if (
      lowerInput.includes("write code") ||
      lowerInput.includes("generate code") ||
      lowerInput.includes("code for") ||
      lowerInput.includes("implement") ||
      lowerInput.includes("function") ||
      lowerInput.includes("algorithm") ||
      lowerInput.includes("program") ||
      lowerInput.includes("class") ||
      lowerInput.includes("script")
    ) {
      return "code"
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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

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

    // Generate a chat ID if this is the first message
    if (!currentChatId) {
      const newChatId = generateChatId()
      setCurrentChatId(newChatId)

      // Update the URL to reflect the new chat ID
      router.push(`/chat/${newChatId}`, { scroll: false })
    }

    try {
      // Choose the appropriate endpoint based on the detected type
      let endpoint = "/api/generateText"

      if (detectedType === "image") {
        endpoint = "/api/generateImage"
      } else if (detectedType === "video") {
        endpoint = "/api/generateVideo"
      } else if (detectedType === "code") {
        endpoint = "/api/generateCode"
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput }),
      })

      if (!response.ok) throw new Error(`Failed to generate response: ${response.statusText}`)

      const data = await response.json()

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.text || "Generated content",
        timestamp: new Date().toLocaleTimeString(),
        type: detectedType,
        mediaUrl: data.mediaUrl,
        codeBlocks: data.codeBlocks,
        isStructured: data.isStructured,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save the updated messages to localStorage
      const updatedMessages = [...messages, userMessage, assistantMessage]
      localStorage.setItem(`chat_messages_${currentChatId}`, JSON.stringify(updatedMessages))
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      }

      setMessages((prev) => [...prev, errorMessage])

      // Save the error message to localStorage too
      const updatedMessages = [...messages, userMessage, errorMessage]
      localStorage.setItem(`chat_messages_${currentChatId}`, JSON.stringify(updatedMessages))
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

    // Generate a chat ID if this is the first message
    if (!currentChatId) {
      const newChatId = generateChatId()
      setCurrentChatId(newChatId)

      // Update the URL to reflect the new chat ID
      router.push(`/chat/${newChatId}`, { scroll: false })
    }

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
      const fileMessage = {
        id: fileMessageId,
        role: "user",
        content: `Uploaded file: ${data.fileName}`,
        timestamp: new Date().toLocaleTimeString(),
        type: data.fileType.startsWith("image/") ? "image" : "text",
        mediaUrl: data.mediaUrl,
        fileType: data.fileType,
        fileName: data.fileName,
      }

      // Add AI response
      const aiResponse = {
        id: uuidv4(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      }

      setMessages((prev) => [...prev, fileMessage as Message, aiResponse as Message])

      // Save the updated messages to localStorage
      const updatedMessages = [...messages, fileMessage, aiResponse]
      localStorage.setItem(`chat_messages_${currentChatId}`, JSON.stringify(updatedMessages))

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
        <ScrollArea className="h-full py-4" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={message.id || `${message.timestamp}-${index}`}
                  className={cn(
                    "w-full max-w-3xl mx-auto",
                    message.role === "user" ? "flex justify-end" : "flex justify-start",
                    message.role === "user" ? "user-message" : "assistant-message",
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
                    ) : (
                      formatMessageContent(message)
                    )}

                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-4 text-gray-400">
                        <Button
                          type="button"
                          className="h-8 w-8 rounded-full hover:bg-gray-800 flex items-center justify-center"
                          onClick={() => handleCopy(message.content, message.id)}
                          onKeyUp={(e) => e.key === "Enter" && handleCopy(message.content, message.id)}
                          aria-label="Copy message"
                        >
                          {copied === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
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
                        </Button>
                        <Button
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
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center w-full animate-fadeIn">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4 animate-pulse-once">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                <p className="text-gray-400 max-w-md">
                  Ask me anything or select a generation type to create text, images, or videos.
                </p>

                {/* Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto mt-8 px-4">
                  {randomSuggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion.prompt}
                      title={suggestion.title}
                      description={suggestion.description}
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center w-full animate-fadeIn">
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
      <div className="p-2 sm:p-4 border-t border-gray-800 bg-black fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-3xl mx-auto w-full px-2">
          {showFilePreview && selectedFile && (
            <div className="mb-2 p-2 bg-gray-800 rounded-md flex items-center justify-between animate-fadeIn">
              <div className="flex items-center">
                <File className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={handleCancelFile}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                  aria-label="Cancel file upload"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={handleFileSubmit}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                  ) : null}
                  Upload
                </Button>
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
              className="min-h-[44px] max-h-32 pr-16 resize-none bg-gray-900 border-gray-700 rounded-full pl-4 py-3 text-white w-full overflow-hidden input-focus-animation"
              rows={1}
            />
            <div className="absolute right-2 bottom-1.5 flex items-center">
              <Button
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
              </Button>
              <Button
                type="button"
                className="h-8 w-8 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50"
                onClick={handleSubmit}
                onKeyUp={(e) => e.key === "Enter" && handleSubmit()}
                disabled={isLoading || (!input.trim() && !selectedFile)}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <Input
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
