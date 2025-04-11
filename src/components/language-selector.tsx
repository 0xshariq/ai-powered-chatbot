"use client"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface LanguageSelectorProps {
  languages: string[]
  onSelect: (language: string) => void
  selectedLanguage: string
}

export function LanguageSelector({ languages, onSelect, selectedLanguage }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      {languages.map((language) => (
        <Button
          key={language}
          onClick={() => onSelect(language)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            selectedLanguage === language
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700",
          )}
        >
          {selectedLanguage === language && <Check className="h-4 w-4" />}
          {language}
        </Button>
      ))}
    </div>
  )
}
