"use client"
import { useState, useEffect } from "react"
import { Check, Copy, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  language: string
  code: string
  showLineNumbers?: boolean
  onEdit?: (code: string) => void
}

export function CodeBlock({ language, code, showLineNumbers = true, onEdit }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(code)
    }
  }

  // Reset copied state when code changes
  useEffect(() => {
    setCopied(false)
  }, [])

  return (
    <div
      className="relative group rounded-md overflow-hidden bg-gray-900 my-4 w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b",
          isHovering ? "bg-gray-700 border-gray-600" : "bg-gray-800 border-gray-700",
        )}
      >
        <div className="text-sm text-gray-400 font-mono">{language}</div>
        <div className="flex space-x-2">
          <button
            type="button"
            className={cn(
              "h-8 px-2 text-sm flex items-center transition-all duration-200",
              copied ? "text-green-400" : "text-gray-400 hover:text-white",
            )}
            onClick={handleCopy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
          >
            {copied ? <Check className={cn("h-4 w-4 mr-1", "animate-fadeIn")} /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          {onEdit && (
            <button
              type="button"
              className="h-8 px-2 text-sm text-gray-400 hover:text-white flex items-center"
              onClick={handleEdit}
              aria-label="Edit code"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>
      <pre className={cn("p-4 overflow-x-auto text-sm font-mono", showLineNumbers && "line-numbers")}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}