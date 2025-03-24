import { Button } from "@/components/ui/button"
import { X, LogIn } from "lucide-react"

export function HeaderNav() {
  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <h1 className="text-sm font-medium">Voice conversation</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="ml-2">
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      </div>
    </header>
  )
}

