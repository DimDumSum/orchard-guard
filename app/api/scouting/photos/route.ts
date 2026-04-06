import { NextRequest, NextResponse } from "next/server"
import { getReferenceImages, getScoutingPhotos, insertScoutingPhoto } from "@/lib/db"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10)

    if (!slug) {
      return NextResponse.json({ error: "slug parameter is required" }, { status: 400 })
    }

    const referenceImages = getReferenceImages(slug)
    const scoutingPhotos = getScoutingPhotos(slug, orchardId)

    return NextResponse.json({ slug, referenceImages, photos: scoutingPhotos })
  } catch (err) {
    console.error("[scouting/photos] GET Error:", err)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    let slug: string
    let notes: string | null = null
    let block: string | null = null
    let severity: string | null = null
    let orchardId = 1
    let date: string = new Date().toISOString().slice(0, 10)
    let filePath = ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      slug = ((formData.get("slug") ?? formData.get("model_slug")) as string) ?? ""
      notes = formData.get("notes") as string | null
      block = formData.get("block") as string | null
      severity = formData.get("severity") as string | null
      orchardId = parseInt(formData.get("orchardId") as string ?? "1", 10)
      date = (formData.get("date") as string) || date

      if (file && file.size > 0) {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", slug)
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }

        const ext = path.extname(file.name) || ".jpg"
        const filename = `${Date.now()}${ext}`
        const fullPath = path.join(uploadsDir, filename)

        const buffer = Buffer.from(await file.arrayBuffer())
        fs.writeFileSync(fullPath, buffer)

        filePath = `/uploads/${slug}/${filename}`
      }
    } else {
      const body = await request.json()
      slug = body.model_slug ?? body.slug ?? ""
      notes = body.notes ?? null
      block = body.block ?? null
      severity = body.severity ?? null
      orchardId = body.orchardId ?? 1
      date = body.date ?? date
    }

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 })
    }

    const id = insertScoutingPhoto({
      orchard_id: orchardId,
      model_slug: slug,
      date,
      file_path: filePath,
      notes: notes || null,
      block: block || null,
      severity: (severity as "trace" | "light" | "moderate" | "severe") || null,
    })

    return NextResponse.json({ success: true, id, filePath }, { status: 201 })
  } catch (err) {
    console.error("[scouting/photos] POST Error:", err)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
