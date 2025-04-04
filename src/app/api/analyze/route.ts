import { NextResponse } from "next/server"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Google AI client
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_AI_API_KEY environment variable")
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export async function POST(request: Request) {
  try {
    const { fileUrl, fileName, fileType, prompt } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 })
    }

    let analysisText = ""

    // For images, use vision models
    if (fileType?.startsWith("image/")) {
      try {
        // Try OpenAI first
        if (process.env.OPENAI_API_KEY) {
          const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt || "Describe this image in detail" },
                  { type: "image_url", image_url: { url: fileUrl } },
                ],
              },
            ],
            max_tokens: 500,
          })
          analysisText = response.choices[0]?.message?.content || ""
        }
        // Fallback to Google Gemini if OpenAI fails or isn't configured
        else if (process.env.GOOGLE_AI_API_KEY) {
          const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })
          const result = await model.generateContent([
            prompt || "Describe this image in detail",
            { inlineData: { data: Buffer.from(fileUrl).toString("base64"), mimeType: fileType } },
          ])
          const response = await result.response
          analysisText = response.text()
        }
      } catch (error) {
        console.error("Error analyzing image:", error)
        analysisText = "I couldn't analyze this image properly. Please try again or upload a different image."
      }
    }
    // For text-based files, extract text and analyze
    else {
      analysisText = `I've received your file: ${fileName}. In a production environment, I would extract the text content and analyze it. For now, please tell me what you'd like to know about this file.`
    }

    return NextResponse.json({
      text: analysisText,
      type: "text",
    })
  } catch (error) {
    console.error("Error analyzing file:", error)
    return NextResponse.json({ error: "Failed to analyze file" }, { status: 500 })
  }
}

