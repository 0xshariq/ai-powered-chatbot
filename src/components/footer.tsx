import { Button } from "@/components/ui/button"
import { Github, Twitter, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Image Generator. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="https://github.com/0xshariq">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Github className="h-4 w-4" />
            </Button>
            </Link>
            <Link href="https://x.com/Sharique_Ch">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Twitter className="h-4 w-4" />
            </Button>
            </Link>
            <Link href="https://www.instagram.com/sharique1303/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Instagram className="h-4 w-4" />
            </Button>
            </Link>
            <Link href="https://www.linkedin.com/in/0xshariq/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Linkedin className="h-4 w-4" />
            </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <span className="mx-2">·</span>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <span className="mx-2">·</span>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

