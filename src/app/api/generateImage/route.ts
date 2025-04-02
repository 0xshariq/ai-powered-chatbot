import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VertexAI } from "@google-cloud/vertexai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
  location: "us-central1",
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Generate enhanced prompt with Gemini 2.0 Flash
    const geminiModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.9 }
    });

    const geminiResult = await geminiModel.generateContent(
      `Enhance this image generation prompt with rich visual details: "${prompt}". 
      Include style references, color palette, and composition details.`
    );
    
    const enhancedPrompt = (await geminiResult.response).text();

    // Generate image with Imagen 3
    const imagenClient = vertexAI.getGenerativeModel({
      model: "imagegeneration@005",
    });

    const imagenResponse = await imagenClient.generateImages({
      prompt: enhancedPrompt,
      numberOfImages: 1,
      dimensions: { width: 1024, height: 1024 },
      quality: "high",
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUAL", threshold: "BLOCK_LOW_AND_ABOVE" },
      ],
    });

    const imageUrl = imagenResponse.images[0].url;

    return NextResponse.json({
      text: `Generated image for: ${prompt}\nEnhanced prompt: ${enhancedPrompt}`,
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