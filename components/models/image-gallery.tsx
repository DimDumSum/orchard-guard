"use client"

import { useState, useEffect, useCallback } from "react"
import { Camera, ChevronLeft, ChevronRight, Upload, ImageIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { REFERENCE_IMAGES, type ReferenceImage } from "@/data/reference-images"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScoutingPhoto {
  id: number
  orchard_id: number
  model_slug: string
  date: string
  file_path: string
  notes: string | null
  block: string | null
  severity: "trace" | "light" | "moderate" | "severe" | null
  created_at: string
}

/** Unified gallery item for both reference images and scouting photos */
interface GalleryItem {
  id: string
  src: string
  caption: string
  credit: string | null
  imageType: ReferenceImage["imageType"] | "upload"
  source: "reference" | "scouting"
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const IMAGE_TYPE_EMOJI: Record<string, string> = {
  symptom: "\u{1F50D}",
  lifecycle: "\u{1F98B}",
  damage: "\u{1F4A5}",
  scouting: "\u{1F441}\uFE0F",
  management: "\u{1F9EA}",
}

const IMAGE_TYPE_BG: Record<string, string> = {
  symptom: "bg-amber-100 dark:bg-amber-900/40",
  lifecycle: "bg-emerald-100 dark:bg-emerald-900/40",
  damage: "bg-red-100 dark:bg-red-900/40",
  scouting: "bg-blue-100 dark:bg-blue-900/40",
  management: "bg-violet-100 dark:bg-violet-900/40",
  upload: "bg-earth-100 dark:bg-earth-900/40",
}

function toGalleryItems(
  refImages: ReferenceImage[],
  scoutingPhotos: ScoutingPhoto[],
): GalleryItem[] {
  const items: GalleryItem[] = []

  for (let i = 0; i < refImages.length; i++) {
    const img = refImages[i]
    items.push({
      id: `ref-${i}-${img.imageType}`,
      src: img.url,
      caption: img.caption,
      credit: img.credit,
      imageType: img.imageType,
      source: "reference",
    })
  }

  for (const photo of scoutingPhotos) {
    if (!photo.file_path) continue
    items.push({
      id: `scouting-${photo.id}`,
      src: photo.file_path,
      caption: photo.notes ?? `Scouting photo — ${photo.date}`,
      credit: photo.block ? `Block ${photo.block}` : null,
      imageType: "upload",
      source: "scouting",
    })
  }

  return items
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Placeholder({ imageType }: { imageType: string }) {
  const emoji = IMAGE_TYPE_EMOJI[imageType] ?? "\u{1F4F7}"
  const bg = IMAGE_TYPE_BG[imageType] ?? "bg-earth-100"

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${bg}`}
      aria-hidden
    >
      <span className="text-3xl">{emoji}</span>
    </div>
  )
}

function ThumbnailCard({
  item,
  onClick,
}: {
  item: GalleryItem
  onClick: () => void
}) {
  const [broken, setBroken] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-earth-50 text-left transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-grove-500 focus-visible:outline-none"
    >
      {/* Image / placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-earth-100">
        {broken ? (
          <Placeholder imageType={item.imageType} />
        ) : (
          <img
            src={item.src}
            alt={item.caption}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={() => setBroken(true)}
          />
        )}
        {/* Badge overlay */}
        <div className="absolute top-1.5 right-1.5">
          <Badge variant="secondary" className="text-[0.65rem] capitalize">
            {item.imageType}
          </Badge>
        </div>
      </div>
      {/* Caption */}
      <div className="px-2 py-1.5">
        <p className="line-clamp-2 text-xs leading-snug text-bark-600">
          {item.caption}
        </p>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

function Lightbox({
  items,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: {
  items: GalleryItem[]
  index: number
  onIndexChange: (i: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const item = items[index]
  const [broken, setBroken] = useState(false)

  // Reset broken state when index changes
  useEffect(() => {
    setBroken(false)
  }, [index])

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + items.length) % items.length)
  }, [index, items.length, onIndexChange])

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % items.length)
  }, [index, items.length, onIndexChange])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, goPrev, goNext])

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden" showCloseButton>
        {/* Image area */}
        <div className="relative flex items-center justify-center bg-black/90 min-h-[50vh] max-h-[70vh]">
          {broken ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <Placeholder imageType={item.imageType} />
              <span className="text-xs text-bark-400">Image unavailable</span>
            </div>
          ) : (
            <img
              src={item.src}
              alt={item.caption}
              className="max-h-[70vh] max-w-full object-contain"
              onError={() => setBroken(true)}
            />
          )}

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-grove-500 focus-visible:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-grove-500 focus-visible:outline-none"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter */}
          {items.length > 1 && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white">
              {index + 1} / {items.length}
            </span>
          )}
        </div>

        {/* Caption overlay */}
        <div className="px-4 py-3">
          <p className="text-sm leading-relaxed text-bark-900">{item.caption}</p>
          {item.credit && (
            <p className="mt-0.5 text-xs text-bark-400">{item.credit}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Upload Dialog
// ---------------------------------------------------------------------------

function UploadDialog({
  slug,
  open,
  onOpenChange,
  onUploaded,
}: {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [severity, setSeverity] = useState("trace")
  const [block, setBlock] = useState("")

  const today = new Date().toISOString().slice(0, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        model_slug: slug,
        date: today,
        block: block || null,
        severity,
        notes: notes || null,
      }

      // If a file was selected, send as multipart; otherwise send JSON
      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("model_slug", slug)
        formData.append("date", today)
        if (block) formData.append("block", block)
        formData.append("severity", severity)
        if (notes) formData.append("notes", notes)

        await fetch("/api/scouting/photos", {
          method: "POST",
          body: formData,
        })
      } else {
        await fetch("/api/scouting/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }

      setSaved(true)
      setTimeout(() => {
        onOpenChange(false)
        setSaved(false)
        setFile(null)
        setNotes("")
        setBlock("")
        setSeverity("trace")
        onUploaded()
      }, 1200)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Scouting Photo</DialogTitle>
          <DialogDescription>
            Add a photo from the field for {slug.replace(/-/g, " ")}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input */}
          <div>
            <Label htmlFor="photo-file">Photo</Label>
            <Input
              id="photo-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="photo-block">Block</Label>
              <Input
                id="photo-block"
                placeholder="e.g. Block A"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="photo-severity">Severity</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(["trace", "light", "moderate", "severe"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      severity === s
                        ? "bg-grove-600 text-white border-grove-600"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="photo-notes">Notes</Label>
            <Textarea
              id="photo-notes"
              placeholder="Describe what you found..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving}>
              {saved ? "Uploaded!" : saving ? "Uploading..." : "Upload Photo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ImageGallery({ slug }: { slug: string }) {
  const [scoutingPhotos, setScoutingPhotos] = useState<ScoutingPhoto[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)

  const refImages = REFERENCE_IMAGES[slug] ?? []

  // Fetch scouting photos from API
  const fetchPhotos = useCallback(() => {
    fetch(`/api/scouting/photos?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : { photos: [] }))
      .then((data) => setScoutingPhotos(data.photos ?? []))
      .catch(() => setScoutingPhotos([]))
  }, [slug])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const items = toGalleryItems(refImages, scoutingPhotos)

  // Graceful empty state — render nothing if no images at all
  if (items.length === 0 && refImages.length === 0) return null

  function openLightbox(idx: number) {
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            Reference Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item, idx) => (
              <ThumbnailCard
                key={item.id}
                item={item}
                onClick={() => openLightbox(idx)}
              />
            ))}

            {/* Upload card */}
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-earth-50 p-4 text-bark-400 transition-colors hover:border-grove-400 hover:bg-grove-50 hover:text-grove-600 focus-visible:ring-2 focus-visible:ring-grove-500 focus-visible:outline-none"
              style={{ minHeight: "120px" }}
            >
              <Camera className="h-8 w-8" />
              <span className="text-xs font-medium">Upload Photo</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      {items.length > 0 && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}

      {/* Upload Dialog */}
      <UploadDialog
        slug={slug}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={fetchPhotos}
      />
    </>
  )
}
