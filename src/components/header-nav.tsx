import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function HeaderNav() {
  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <h1 className="text-sm font-medium">Voice conversation</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Save conversation
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

