"use client"

import type React from "react"
import { useState } from "react"
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

  const handleKeyboardCopy = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCopy()
    }
  }

  const handleKeyboardEdit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleEdit()
    }
  }

  return (
    <div className="relative group rounded-md overflow-hidden bg-gray-900 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="text-sm text-gray-400">{language}</div>
        <div className="flex space-x-2">
          <button
            type="button"
            className="h-8 px-3 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-700 flex items-center"
            onClick={handleCopy}
            onKeyUp={handleKeyboardCopy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {onEdit && (
            <button
              type="button"
              className="h-8 px-3 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-700 flex items-center"
              onClick={handleEdit}
              onKeyUp={handleKeyboardEdit}
              aria-label="Edit code"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>
      <pre className={cn("p-4 overflow-x-auto", showLineNumbers && "line-numbers")}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

