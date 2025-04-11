import { redirect } from "next/navigation"

// Generate a chat ID in the format "title-randomid"
function generateChatId() {
  // Default title for a new chat
  const baseTitle = "new-chat"
  
  // Generate a random string of 6-8 characters
  const randomChars = Math.random().toString(36).substring(2, 8)
  
  // Combine them
  return `${baseTitle}-${randomChars}`
}

export default function DashboardPage() {
  const chatId = generateChatId()
  redirect(`/chat/${chatId}`)
}