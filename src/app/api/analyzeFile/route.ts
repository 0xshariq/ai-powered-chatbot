import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

// Initialize Google AI client
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_AI_API_KEY environment variable")
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export async function POST(request: Request) {
  try {
    // Handle file upload directly in this endpoint
    const formData = await request.formData()
    const file = formData.get("file") as File
    const promptText = (formData.get("prompt") as string) || "Analyze this file and provide insights"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get file extension and generate unique filename
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = `${uuidv4()}.${fileExtension}`

    // Convert file to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (err) {
      console.log("Uploads directory already exists or cannot be created")
      console.error(err)
    }

    // Define path to save the file
    const path = join(uploadsDir, fileName)

    // Save the file
    await writeFile(path, buffer)

    // Create the URL to access the file
    const fileUrl = `/uploads/${fileName}`
    const fileType = file.type

    let analysisText = ""

    // For images, use Google's vision model
    if (fileType.startsWith("image/")) {
      try {
        // Convert image to base64 for Google AI
        const base64Image = buffer.toString("base64")

        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })
        const result = await model.generateContent([
          promptText,
          { inlineData: { data: base64Image, mimeType: fileType } },
        ])
        const response = await result.response
        analysisText = response.text()
      } catch (error) {
        console.error("Error analyzing image:", error)
        analysisText = "I couldn't analyze this image properly. Please try again or upload a different image."
      }
    }
    // For text-based files, extract text and analyze
    else {
      analysisText = `I've received your file: ${file.name}. In a production environment, I would extract the text content and analyze it. For now, please tell me what you'd like to know about this file.`
    }

    return NextResponse.json({
      text: analysisText,
      type: "text",
      mediaUrl: fileUrl,
      fileName: file.name,
      fileType: fileType,
    })
  } catch (error) {
    console.error("Error analyzing file:", error)
    return NextResponse.json({ error: "Failed to analyze file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

