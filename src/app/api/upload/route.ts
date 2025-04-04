import { NextResponse } from "next/server"
import { writeFile } from "node:fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get file extension
    const fileExtension = file.name.split(".").pop() || ""

    // Generate a unique filename
    const fileName = `${uuidv4()}.${fileExtension}`

    // Convert file to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Define path to save the file
    const path = join(process.cwd(), "public", "uploads", fileName)

    // Save the file
    await writeFile(path, buffer)

    // Return the URL to access the file
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileType: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

