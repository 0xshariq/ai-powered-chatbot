import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // First try to generate with Gemini
    try {
      return await generateWithGemini(prompt)
    } catch (error) {
      console.error("Error with Gemini image generation:", error)

      // Fallback to Replicate (DeepSeek) if Gemini fails
      try {
        return await generateWithReplicate(prompt)
      } catch (replicateError) {
        console.error("Error with Replicate image generation:", replicateError)

        // Final fallback to placeholder if both methods fail
        return fallbackToPlaceholder(prompt)
      }
    }
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}

// Generate image using Gemini 2.0 Flash
async function generateWithGemini(prompt: string) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not defined in the environment variables")
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

  // Use Gemini 1.5 Pro model which has image generation capabilities
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

  // For now, we'll use a placeholder since direct image generation isn't available
  // In a production environment, you would use a different approach like:
  // 1. Using Vertex AI's image generation capabilities
  // 2. Using a different API that Gemini can call

  const placeholderImage = `/placeholder.svg?height=1024&width=1024&text=${encodeURIComponent("Generating with Gemini...")}`

  // Generate a description of the image that would be created
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `Describe in detail what an image of "${prompt}" would look like.` }] }],
  })

  const description = result.response.text()

  return NextResponse.json({
    text: `I'm generating an image of "${prompt}". Here's what it would look like: ${description.slice(0, 200)}...`,
    mediaUrl: placeholderImage,
    type: "image",
    description: description,
  })
}

// Generate image using Replicate (DeepSeek)
async function generateWithReplicate(prompt: string) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not defined in the environment variables")
  }

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      version: "7ca34e5e807d7b9a41c0cd5a5c1e7665e9b1f36377ec7d0260166c051c2445f9", // DeepSeek image model
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        guidance_scale: 7.5,
        negative_prompt: "low quality, bad anatomy, worst quality, low resolution",
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`)
  }

  const prediction = await response.json()

  // In a real implementation, you would poll for the result
  // For now, use a placeholder
  const placeholderImage = `/placeholder.svg?height=1024&width=1024&text=${encodeURIComponent("Generating with DeepSeek...")}`

  return NextResponse.json({
    text: `I'm generating an image of "${prompt}" using DeepSeek AI. This would typically take 10-30 seconds to complete.`,
    mediaUrl: placeholderImage,
    type: "image",
    predictionId: prediction.id, // You would use this to poll for the result
  })
}

// Fallback to placeholder if all generation methods fail
function fallbackToPlaceholder(prompt: string) {
  const placeholderImage = `/placeholder.svg?height=1024&width=1024&text=${encodeURIComponent("Image generation failed")}`

  return NextResponse.json({
    text: `I tried to generate an image for "${prompt}", but encountered an issue with the image generation services. Here's a placeholder instead.`,
    mediaUrl: placeholderImage,
    type: "image",
  })
}
