import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI model
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

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Enhance the prompt to generate well-formatted code
    const enhancedPrompt = `
      Generate clean, well-commented code for the following request: ${prompt}
      
      Please format your response as follows:
      1. Start with a brief explanation of what the code does
      2. Include the code in a code block with the appropriate language tag
      3. If multiple languages are relevant, provide examples in each language
      4. Add comments to explain complex parts of the code
      
      For example:
      
      Here's a JavaScript implementation of a simple counter:
      
      \`\`\`javascript
      // Counter implementation
      let count = 0;
      
      function increment() {
        count++;
        return count;
      }
      \`\`\`
    `

    // Generate code using Gemini
    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const text = response.text()

    // Extract code blocks from the response
    const codeBlocks = extractCodeBlocks(text)

    return NextResponse.json({
      text: text,
      type: "code",
      codeBlocks: codeBlocks,
    })
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}

// Helper function to extract code blocks from text
function extractCodeBlocks(text: string) {
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g
  const codeBlocks = []

  let match: RegExpExecArray | null
  match = codeBlockRegex.exec(text);
  while (match !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    });
    match = codeBlockRegex.exec(text);
  }

  return codeBlocks
}
