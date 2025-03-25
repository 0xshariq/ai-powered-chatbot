import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI model
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Get the generative model (use gemini-pro-vision for image generation context)
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Generate content using gemini-pro-vision, which can handle image generation requests.
    const result = await model.generateContent([
      prompt, // The prompt
      // In a real implementation, you would pass an image here if you wanted to use an existing one as context.
      // {
      //   inlineData: {
      //     mimeType: "image/jpeg", // or "image/png"
      //     data: base64ImageData, // Replace with your base64 image data
      //   },
      // },
    ]);

    const response = await result.response;
    const text = response.text();

    // In a production environment, you would replace the placeholder with the actual generated image URL.
    // Assuming the API returns a proper image URL or base64 data.
    const mediaUrl = text.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg)\))/i)?.[0] || `/placeholder.svg?height=400&width=600`; //try to get the image url from the response, if not found, use placeholder.
    const type = mediaUrl.endsWith(".svg") ? "image" : "image"; //always return image, for consistency

    return NextResponse.json({
      text: `I've attempted to generate an image based on your prompt: "${prompt}".\n\n${text}`,
      mediaUrl: mediaUrl,
      type: type,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}