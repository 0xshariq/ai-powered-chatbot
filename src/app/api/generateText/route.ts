import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI model
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
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
        Provide a clear explanation about "${prompt}". 
        Keep your response conversational and easy to understand.
        Use simple language and avoid overly technical terms unless necessary.
        
        Note: You are using the Janus-Pro-7B model.
      `
    } else {
      enhancedPrompt = `${prompt}\n\nNote: You are using the Janus-Pro-7B model.`
    }

    // Get the generative model - Using Gemini Pro as a proxy for Janus-Pro-7B
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Generate text
    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const text = response.text()

    // Process the response to make it more readable and conversational
    const processedResponse = processTextResponse(text)

    return NextResponse.json({
      text: processedResponse,
      type: "text",
      isStructured: isExplanationPrompt(prompt),
      model: "Janus-Pro-7B", // Indicate the model used
    })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json(
      {
        error: "Failed to generate text",
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        type: "text",
      },
      { status: 500 },
    )
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
  // Remove any markdown formatting that might make the text less readable
  let processedText = text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
    .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
    .replace(/```[a-z]*\n/g, "") // Remove code block language indicators
    .replace(/```/g, "") // Remove code block markers
    .replace(/#{1,6}\s+/g, "") // Remove heading markers

  // Ensure proper spacing around paragraphs
  processedText = processedText.replace(/\n{3,}/g, "\n\n")

  // Make the text more conversational
  processedText = processedText
    .replace(/^In conclusion,/gi, "To sum up,")
    .replace(/^To summarize,/gi, "In short,")
    .replace(/^It is important to note that/gi, "Keep in mind that")
    .replace(/^Please note that/gi, "Remember that")
    .replace(/^As mentioned earlier,/gi, "As I said,")
    .replace(/^Furthermore,/gi, "Also,")
    .replace(/^Additionally,/gi, "Plus,")
    .replace(/^Moreover,/gi, "What's more,")
    .replace(/^However,/gi, "But,")
    .replace(/^Nevertheless,/gi, "Still,")
    .replace(/^Consequently,/gi, "As a result,")
    .replace(/^Therefore,/gi, "So,")
    .replace(/^Thus,/gi, "So,")
    .replace(/^In summary,/gi, "To wrap up,")

  return processedText
}
