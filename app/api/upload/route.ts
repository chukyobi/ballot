/**
 * POST /api/upload — upload a candidate image
 * Accepts multipart/form-data with a "file" field.
 * Saves to public/uploads/candidates/ and returns the URL path.
 */
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file || !file.name) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 })
        }

        // Validate MIME type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG." },
                { status: 400 }
            )
        }

        // Limit file size (5 MB)
        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File too large. Max 5 MB." },
                { status: 400 }
            )
        }

        // Read file bytes
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const ext = path.extname(file.name) || ".jpg"
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "candidates")
        await mkdir(uploadDir, { recursive: true })

        // Write file
        const filePath = path.join(uploadDir, uniqueName)
        await writeFile(filePath, buffer)

        // Return the public URL
        const url = `/uploads/candidates/${uniqueName}`
        return NextResponse.json({ url }, { status: 201 })
    } catch (err) {
        console.error("[POST /api/upload]", err)
        return NextResponse.json({ error: "Upload failed." }, { status: 500 })
    }
}
