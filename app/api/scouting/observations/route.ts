import { NextRequest, NextResponse } from "next/server"
import { getDb, insertScoutingPhoto, getScoutingPhotos } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10)

    if (!slug) {
      return NextResponse.json({ error: "slug parameter is required" }, { status: 400 })
    }

    const photos = getScoutingPhotos(slug, orchardId)
    return NextResponse.json({ slug, photos })
  } catch (err) {
    console.error("[scouting] GET Error:", err)
    return NextResponse.json({ error: "Failed to fetch scouting observations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model_slug, date, block = null, severity = null, notes = null, orchardId = 1 } = body

    if (!model_slug || !date) {
      return NextResponse.json({ error: "model_slug and date are required" }, { status: 400 })
    }

    const id = insertScoutingPhoto({
      orchard_id: orchardId,
      model_slug,
      date,
      file_path: "",
      notes,
      block,
      severity,
    })

    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (err) {
    console.error("[scouting] POST Error:", err)
    return NextResponse.json({ error: "Failed to save scouting observation" }, { status: 500 })
  }
}
