import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI model
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY is not defined in the environment variables.")
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Enhance the prompt to generate well-formatted code in multiple languages
    const enhancedPrompt = `
      Generate clean, well-commented code for the following request: ${prompt}
      
      Please provide examples in multiple programming languages (Python, JavaScript, and C++ if applicable).
      
      For each language:
      1. Start with a brief introduction
      2. Include the code in a code block with proper syntax highlighting
      3. Add helpful comments to explain the code
      
      Format each language section with a clear heading.
    `

    // Generate code using Gemini
    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const text = response.text()

    // Extract code blocks and language sections from the response
    const languageSections = extractLanguageSections(text)
    const codeBlocks = extractCodeBlocks(text)

    return NextResponse.json({
      text: text,
      type: "code",
      codeBlocks: codeBlocks,
      languageSections: languageSections,
    })
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}

// Helper function to extract language sections from text
function extractLanguageSections(text: string) {
  const languageRegex =
    /(?:^|\n)(?:#{1,3}\s*)?(Python|JavaScript|TypeScript|Java|C\+\+|C#|Ruby|Go|PHP|Rust|Swift)(?:\s*:|\n)/gi
  const sections = []

  const match: RegExpExecArray | null = languageRegex.exec(text)
  let lastIndex = 0 // Track the last index processed

  while ((match) !== null) {
    const language = match[1]
    const startIndex = match.index

    // Find the next language section or end of text
    const nextMatch = languageRegex.exec(text)
    const endIndex = nextMatch ? nextMatch.index : text.length

    // Extract the section content
    const content = text.substring(startIndex, endIndex).trim()

    sections.push({
      language,
      content,
    })

    // Update lastIndex to track progress
    lastIndex = endIndex
  }

  // Use lastIndex to ensure all text is processed
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim()
    if (remainingText) {
      sections.push({
        language: "Unknown",
        content: remainingText,
      })
    }
  }

  return sections
}

// Helper function to extract code blocks from text
function extractCodeBlocks(text: string) {
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g
  const codeBlocks = []

  const match : RegExpExecArray | null = codeBlockRegex.exec(text)
  while (match !== null) {
    codeBlocks.push({
      language: match[1]?.toLowerCase() || "text",
      code: match[2].trim(),
    })
  }

  return codeBlocks
}
