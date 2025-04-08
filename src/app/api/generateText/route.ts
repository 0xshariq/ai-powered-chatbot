import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY is not defined in the environment variables");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Enhance the prompt for better structured responses if it's an explanation
    let enhancedPrompt = prompt
    if (isExplanationPrompt(prompt)) {
      enhancedPrompt = `
        Provide a detailed explanation about "${prompt}". 
        Format your response with:
        1. A brief introduction
        2. Numbered points for main concepts
        3. Use clear headings for different aspects or applications
        
        Make the explanation educational and comprehensive.
      `
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Generate text using Gemini
    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const text = response.text()

    // Process the response to make it more readable
    const processedResponse = processTextResponse(text)

    return NextResponse.json({
      text: processedResponse,
      type: "text",
      isStructured: isExplanationPrompt(prompt),
    })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 })
  }
}

// Helper function to determine if the prompt is asking for an explanation
function isExplanationPrompt(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()
  return (
    lowerPrompt.includes("explain") ||
    lowerPrompt.includes("what is") ||
    lowerPrompt.includes("how does") ||
    lowerPrompt.includes("describe") ||
    lowerPrompt.includes("tell me about") ||
    lowerPrompt.startsWith("what") ||
    lowerPrompt.startsWith("how") ||
    lowerPrompt.startsWith("why")
  )
}

// Helper function to process text responses for better readability
function processTextResponse(text: string) {
  // Ensure proper spacing around numbered points
  let processedText = text.replace(/(\d+\.\s+[^\n]+)(\n)(?!\n)/g, "$1\n\n")

  // Ensure proper spacing around headings
  processedText = processedText.replace(/([A-Z][^:]+:)(\n)(?!\n)/g, "$1\n\n")

  // Ensure proper spacing after paragraphs
  processedText = processedText.replace(/(\.)(\n)(?!\n)/g, "$1\n\n")

  return processedText
}
