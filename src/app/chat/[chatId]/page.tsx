import ChatInterface from "@/app/chat-interface"
import { notFound } from "next/navigation"

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  // Await params to access its properties
  const { chatId } = await params

  // Validate the chatId format to ensure it's legitimate
  const isValidChatId = /^new-chat-[A-Z0-9]{8,10}$/.test(chatId)

  if (!isValidChatId) {
    notFound()
  }

  return <ChatInterface initialChatId={chatId} />
}