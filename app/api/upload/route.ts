import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const degree = formData.get("degree") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a safe filename
    const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `rituales/${degree || "unknown"}/${safeFileName}`

    // Upload file to Vercel Blob
    const blob = await put(filePath, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      size: blob.size,
      contentType: blob.contentType,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
