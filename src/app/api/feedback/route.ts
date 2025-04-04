import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messageId, feedback, chatId } = await request.json()

    if (!messageId || !feedback || !chatId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real application, you would store this feedback in a database
    console.log(`Feedback received: ${feedback} for message ${messageId} in chat ${chatId}`)

    // You could also send this feedback to your AI provider for model improvement
    // Example: await openai.createFeedback({ messageId, feedback })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing feedback:", error)
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 })
  }
}

