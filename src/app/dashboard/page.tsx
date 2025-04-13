import { redirect } from "next/navigation"

// Generate a chat ID in the format shown in the image
function generateChatId() {
  // Create a base string with the prefix
  const baseString = "new-chat-"

  // Generate a random string of 8-10 characters (mix of letters and numbers)
  const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase()

  // Combine them
  return `${baseString}${randomChars}`
}

export default function DashboardPage() {
  const chatId = generateChatId()
  redirect(`/chat/${chatId}`)
}