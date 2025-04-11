import ChatInterface from "@/app/chat-interface"
import { notFound } from "next/navigation"

export default function ChatPage({ params }: { params: { chatId: string } }) {
  // Validate the chatId format to ensure it's legitimate
  // The format should be "title-randomid"
  const isValidChatId = /^[a-z0-9-]+-[a-z0-9]{6,8}$/.test(params.chatId)

  if (!isValidChatId) {
    notFound()
  }

  return <ChatInterface initialChatId={params.chatId} />
}