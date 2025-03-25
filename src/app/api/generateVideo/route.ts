import { NextResponse } from "next/server";
import OpenAI from "openai";

interface GeneratedImage {
    url: string;
  }

  interface ImageResponse {
    data: GeneratedImage[];
  }
// Initialize the OpenAI model for DALL-E
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // DALL-E 3 for image generation (as DALL-E itself doesn't directly generate video)
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 4, // Generate 4 images (adjust as needed for video length)
      size: "1024x1024", // Adjust image size
    });

    const imageUrls: string[] = response.data
      .map((image) => image.url ?? "")
      .filter((url) => url !== "");

    return NextResponse.json({
      imageUrls: imageUrls,
      type: "video",
      text: "Here are the images generated for your video. You will need to use a video editing tool to create a video from these images.",
    });
  } catch (error: any) { // Type the error as any
    if (error.response) { // Handle openAI errors.
      console.error("OpenAI API Error:", error.response.status, error.response.data);
    } else {
      console.error("Error generating video:", error);
    }
    return NextResponse.json({ error: "Failed to generate video" }, { status: 500 });
  }
}