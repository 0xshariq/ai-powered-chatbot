import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY is not defined in the environment variables.");
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Use vision model for image-related processing
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate detailed image description
    const descriptionResult = await model.generateContent(
      `Generate a detailed image description for: "${prompt}". 
      Include visual elements, style, colors, and composition.`
    );
    
    const description = (await descriptionResult.response).text();

    // In production, replace this with actual image generation API call
    // This is a placeholder using Unsplash random images
    const imageUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(
      prompt.replace(/ /g, ',')
    )}`;

    return NextResponse.json({
      text: `I generated an image based on: "${prompt}". Description: ${description}`,
      mediaUrl: imageUrl
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}