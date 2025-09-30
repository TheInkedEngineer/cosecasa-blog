"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

import { ImagePlus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { uploadArticleImagesAction } from "./actions"
import { initialUploadImagesState, type UploadImagesState } from "./state"

interface LocalImage {
  id: string
  file: File
  preview: string
}

interface UploadImagesFormProps {
  prefix: string
  articleName: string
}

export function UploadImagesForm({ prefix, articleName }: UploadImagesFormProps) {
  const [state, formAction] = useFormState<UploadImagesState, FormData>(
    uploadArticleImagesAction,
    initialUploadImagesState,
  )
  const [images, setImages] = useState<LocalImage[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imagesRef = useRef<LocalImage[]>([])

  const isSuccess = hasSubmitted && state.success
  const isError = hasSubmitted && !state.success && Boolean(state.error)
  const isSubmitDisabled = images.length === 0

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview))
    }
  }, [])

  useEffect(() => {
    if (hasSubmitted && state.success && state.prefix) {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview))
      setImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setHasSubmitted(false)
      void router.push(`/admin?prefix=${encodeURIComponent(state.prefix)}`)
    }
  }, [hasSubmitted, router, state.prefix, state.success])

  const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const nextImages: LocalImage[] = []

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return
      }

      const identifier = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

      const alreadySelected = images.some(
        (image) => image.file.name === file.name && image.file.size === file.size,
      )

      if (!alreadySelected) {
        nextImages.push({ id: identifier, file, preview: URL.createObjectURL(file) })
      }
    })

    if (nextImages.length > 0) {
      setImages((prev) => [...prev, ...nextImages])
      setHasSubmitted(false)
    }

    if (event.target) {
      event.target.value = ""
    }
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((image) => image.id !== id)
      const removed = prev.find((image) => image.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return next
    })
    setHasSubmitted(false)
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <form
          className="space-y-6"
          action={() => {
            setHasSubmitted(true)
            const formData = new FormData()
            formData.set("prefix", prefix)
            images.forEach((image) => {
              formData.append("images", image.file)
            })
            return formAction(formData)
          }}
        >
          <div className="space-y-2">
            <span className="block text-sm font-medium text-muted-foreground">
              Immagini da aggiungere a <code>{articleName}</code>
            </span>
            <input
              ref={fileInputRef}
              id="article-images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full cursor-pointer rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-brand-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-secondary-foreground hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              onChange={handleImagesChange}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border border-border">
                  <img src={image.preview} alt={image.file.name} className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-opacity hover:opacity-90"
                    aria-label={`Rimuovi ${image.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="truncate bg-background/80 px-2 py-1 text-center text-xs text-muted-foreground">
                    {image.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-3">
            <SubmitButton disabled={isSubmitDisabled} />
            <p className="text-xs text-muted-foreground">
              Le immagini saranno salvate nella cartella <code>{prefix}</code> senza modificare il file <code>text.md</code>.
            </p>
          </div>
        </form>

        {isSuccess && state.images && state.images.length > 0 && (
          <div className="space-y-3 rounded-lg border border-brand-primary/30 bg-brand-primary/5 p-4 text-sm">
            <p className="font-medium text-brand-primary">
              Caricamento completato. Le nuove immagini sono ora disponibili.
            </p>
            <div className="space-y-1">
              {state.images.map((asset) => (
                <UploadedAsset key={asset.filename} asset={asset} />
              ))}
            </div>
          </div>
        )}

        {isError && state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {state.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || disabled} className="inline-flex items-center gap-2">
      <ImagePlus className="h-4 w-4" aria-hidden="true" />
      {pending ? "Caricamento..." : "Carica immagini"}
    </Button>
  )
}

function UploadedAsset({ asset }: { asset: NonNullable<UploadImagesState["images"]>[number] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 text-xs">
      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
        Immagine
      </Badge>
      <span className="truncate text-muted-foreground">{asset.filename}</span>
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto text-brand-primary underline-offset-4 hover:underline"
      >
        Apri
      </a>
    </div>
  )
}
