import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure API key is available
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY is missing from environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid or missing prompt." }, { status: 400 });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate text response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Ensure response is human-readable
    text = text.replace(/\n{2,}/g, "\n"); // Reduce excessive line breaks
    text = text.replace(/[*_]/g, ""); // Remove markdown formatting
    text = text.replace(/\s+/g, " ").trim(); // Normalize whitespace

    return NextResponse.json({
      text,
      type: "text",
    });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json({ error: "Failed to generate response. Please try again." }, { status: 500 });
  }
}
