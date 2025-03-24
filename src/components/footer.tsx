import { Button } from "@/components/ui/button"
import { Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Image Generator. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <a href="#" className="hover:underline">
              Terms
            </a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

