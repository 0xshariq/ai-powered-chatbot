"use client"

import { useState } from "react"
import { CodeBlock } from "./code-block"
import { Separator } from "@/components/ui/separator"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface CodeResponseProps {
  text: string
  codeBlocks: Array<{
    language: string
    code: string
  }>
  languageSections?: Array<{
    language: string
    content: string
  }>
}

export function CodeResponse({ text, codeBlocks, languageSections }: CodeResponseProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, boolean>>({})

  // Extract the introduction text (before any code blocks)
  const introText = text.split("```")[0].trim()

  // Toggle language selection
  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) => ({
      ...prev,
      [language]: !prev[language],
    }))
  }

  // Group code blocks by language
  const groupedBlocks: Record<string, typeof codeBlocks> = {}
  for (const block of codeBlocks) {
    if (!groupedBlocks[block.language]) {
      groupedBlocks[block.language] = []
    }
    groupedBlocks[block.language].push(block)
  }

  return (
    <div className="space-y-4">
      {/* Introduction text */}
      {introText && (
        <div className="mb-4">
          <p className="whitespace-pre-wrap">{introText}</p>
        </div>
      )}

      {/* Language sections with checkboxes */}
      {Object.entries(groupedBlocks).map(([language, blocks], index) => (
        <div key={language} className="animate-fadeIn">
          {index > 0 && <Separator className="my-6 bg-gray-700" />}
          <Button
            type="button"
            className={cn(
              "flex items-center gap-2 mb-3 cursor-pointer",
              selectedLanguages[language] && "text-green-400",
            )}
            onClick={() => toggleLanguage(language)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleLanguage(language)
              }
            }}
            tabIndex={0}
          >
            <div
              className={cn(
                "h-5 w-5 flex items-center justify-center border rounded-sm transition-colors",
                selectedLanguages[language] ? "border-green-400 bg-green-400/20" : "border-gray-600",
              )}
            >
              {selectedLanguages[language] && <Check className="h-4 w-4 text-green-400" />}
            </div>
            <h3 className="text-lg font-medium capitalize">{language}</h3>
          </Button>

          {blocks.map((block, blockIndex) => (
            <div key={`${block.language}-${block.code}`} className="ml-7">
              <CodeBlock language={block.language} code={block.code} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}