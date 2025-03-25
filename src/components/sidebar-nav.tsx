import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutGrid, Settings, Users, SettingsIcon as Functions, Layers, Eye, BarChart2 } from "lucide-react"

export function SidebarNav() {
  return (
    <div className="w-64 border-r bg-muted/10">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary" />
          <span className="font-semibold">AI Chatbot</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="space-y-4 p-4">
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Tasks
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Functions className="mr-2 h-4 w-4" />
              Functions
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Layers className="mr-2 h-4 w-4" />
              Integrations
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
          <div className="pt-4 border-t">
            <Button variant="ghost" className="w-full justify-start">
              <Eye className="mr-2 h-4 w-4" />
              Live preview
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart2 className="mr-2 h-4 w-4" />
              Performance
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

