import Link from "next/link";

export function Footer() {
  return (
    <div className="flex items-center justify-between py-2 text-xs text-gray-500">
      <div>© {new Date().getFullYear()} AI Powered Chatbot. All rights reserved.</div>
      <div className="flex items-center space-x-3">
        <Link href="#" className="hover:text-white transition-colors">
          Terms
        </Link>
        <span>·</span>
        <Link href="#" className="hover:text-white transition-colors">
          Privacy
        </Link>
        <span>·</span>
        <Link href="#" className="hover:text-white transition-colors">
          Contact
        </Link>
      </div>
    </div>
  )
}
