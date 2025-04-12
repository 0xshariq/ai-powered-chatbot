import ChatInterface from "@/app/chat-interface"
import { notFound } from "next/navigation"

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  // Await the params to access its properties
  const { chatId } = await params

  // Validate the chatId format to ensure it's legitimate
  // The format should be "title-randomid"
  const isValidChatId = /^[a-z0-9-]+-[a-z0-9]{6,8}$/.test(chatId)

  if (!isValidChatId) {
    notFound()
  }

  return <ChatInterface initialChatId={chatId} />
}