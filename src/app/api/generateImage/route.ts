import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client with DALL-E 3
const openai = new OpenAI({
  apiKey: (() => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in the environment variables");
    }
    return process.env.OPENAI_API_KEY;
  })(),
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    try {
      // Generate image using DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024", // DALL-E 3 supports 1024x1024, 1792x1024, or 1024x1792
        quality: "standard", // or "hd" for higher quality
        style: "vivid", // or "natural" for less dramatic results
      })

      const imageUrl = response.data[0].url

      return NextResponse.json({
        text: `Generated image for: "${prompt}"`,
        mediaUrl: imageUrl,
        type: "image",
      })
    } catch (openaiError) {
      console.error("OpenAI error:", openaiError)

      // Fallback to placeholder if OpenAI fails
      const placeholderWidth = 1024
      const placeholderHeight = 1024
      const mediaUrl = `/placeholder.svg?height=${placeholderHeight}&width=${placeholderWidth}`

      return NextResponse.json({
        text: `I tried to generate an image for "${prompt}", but encountered an issue with the image generation service. Here's a placeholder instead.`,
        mediaUrl: mediaUrl,
        type: "image",
      })
    }
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}

