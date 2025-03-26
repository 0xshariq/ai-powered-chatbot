import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    try {
      // Using Replicate API for video generation (free tier available)
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "c24440e965843dd1d5d6ef78fd4b8d3d7d138d9f5c0d1b82648512fd89e342b1", // Zeroscope v2 XL model
          input: {
            prompt: prompt,
            num_frames: 24, // Lower frame count to use fewer credits
            fps: 8,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`)
      }

      const prediction = await response.json()

      // For async APIs like Replicate, we need to poll for the result
      // In a real implementation, you would use a webhook or polling
      // For this example, we'll return a placeholder and explain the process

      const placeholderVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

      return NextResponse.json({
        text: `I've started generating a video based on your prompt: "${prompt}"\n\nVideo generation takes time (typically 1-2 minutes). In a production environment, this would be handled through a webhook or polling mechanism.\n\nFor now, here's a placeholder video.`,
        mediaUrl: placeholderVideo,
        type: "video",
        predictionId: prediction.id, // You would use this to poll for the result
      })
    } catch (error) {
      console.error("Error with Replicate API:", error)

      // Fallback to placeholder if Replicate fails
      const placeholderVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

      return NextResponse.json({
        text: `I tried to generate a video for "${prompt}", but encountered an issue with the video generation service. Here's a placeholder instead.`,
        mediaUrl: placeholderVideo,
        type: "video",
      })
    }
  } catch (error) {
    console.error("Error generating video:", error)
    return NextResponse.json({ error: "Failed to generate video" }, { status: 500 })
  }
}

