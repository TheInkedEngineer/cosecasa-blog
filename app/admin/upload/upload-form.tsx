"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"

import { FileText, RefreshCcw, Trash2, X, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { uploadMarkdownAction } from "./actions"
import { initialUploadState, type UploadState } from "./state"

interface LocalImage {
  id: string
  file: File
  preview: string
}

export function UploadForm() {
  const [state, formAction] = useFormState<UploadState, FormData>(uploadMarkdownAction, initialUploadState)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [title, setTitle] = useState("")
  const [markdownFile, setMarkdownFile] = useState<File | null>(null)
  const [images, setImages] = useState<LocalImage[]>([])

  const router = useRouter()
  const markdownInputRef = useRef<HTMLInputElement | null>(null)
  const imagesRef = useRef<LocalImage[]>([])
  const hasNavigatedRef = useRef(false)

  const isSuccess = hasSubmitted && state.success
  const isError = hasSubmitted && !state.success && Boolean(state.error)
  const isSubmitDisabled = !title.trim() || !markdownFile

  const basePath = useMemo(() => (state.slug ? `articles/${state.slug}` : undefined), [state.slug])

  useEffect(() => {
    if (!state.success || hasNavigatedRef.current) {
      return
    }

    hasNavigatedRef.current = true

    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview))
    setImages([])
    setMarkdownFile(null)
    setTitle("")
    setHasSubmitted(false)
    if (markdownInputRef.current) {
      markdownInputRef.current.value = ""
    }

    const targetPrefix = state.slug ? `articles/${state.slug}/` : undefined
    const destination = targetPrefix ? `/admin?prefix=${encodeURIComponent(targetPrefix)}` : "/admin"

    void router.replace(destination)
  }, [router, state.success, state.slug])

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview))
    }
  }, [])

  const handleMarkdownChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setMarkdownFile(file)
    setHasSubmitted(false)
    if (event.target) {
      event.target.value = ""
    }
  }

  const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const nextImages: LocalImage[] = []

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return
      }

      const identifier = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      const alreadySelected = images.some((image) => image.file.name === file.name && image.file.size === file.size)

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
            formData.set("title", title.trim())
            if (markdownFile) {
              formData.set("markdown", markdownFile)
            }
            images.forEach((image) => {
              formData.append("images", image.file)
            })

            return formAction(formData)
          }}
        >
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">
              Titolo dell'articolo
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setHasSubmitted(false)
              }}
              placeholder="Es. La danza della luce a Firenze"
              className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-muted-foreground">File Markdown (.md)</span>
            {!markdownFile ? (
              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground transition hover:border-brand-primary">
                <input
                  ref={markdownInputRef}
                  id="markdown-file"
                  name="markdown"
                  type="file"
                  accept=".md,text/markdown"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={handleMarkdownChange}
                />
                <FileText className="mb-3 h-6 w-6 text-muted-foreground transition group-hover:text-brand-primary" />
                <span className="font-medium text-foreground">Scegli un file markdown</span>
                <span className="mt-1 text-xs text-muted-foreground">Trascina qui oppure clicca per selezionare</span>
              </label>
            ) : (
              <>
                <input
                  ref={markdownInputRef}
                  id="markdown-file"
                  name="markdown"
                  type="file"
                  accept=".md,text/markdown"
                  className="hidden"
                  onChange={handleMarkdownChange}
                />
                <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <FileText className="h-5 w-5 text-brand-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">{markdownFile.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(markdownFile.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton
                      icon={RefreshCcw}
                      label="Sostituisci file"
                      onClick={() => markdownInputRef.current?.click()}
                    />
                    <IconButton
                      icon={Trash2}
                      label="Rimuovi file"
                      onClick={() => {
                        setMarkdownFile(null)
                        setHasSubmitted(false)
                        if (markdownInputRef.current) {
                          markdownInputRef.current.value = ""
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="images" className="block text-sm font-medium text-muted-foreground">
                Immagini opzionali
              </label>
              <input
                id="images"
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
          </div>

          <div className="flex items-start gap-3">
            <SubmitButton disabled={isSubmitDisabled} />
            <p className="text-xs text-muted-foreground">
              Assicurati di avere impostato la variabile <code>BLOB_READ_WRITE_TOKEN</code>. I file saranno caricati in
              percorsi del tipo <code className="ml-1">articles/&#123;slug-del-titolo&#125;</code>.
            </p>
          </div>
        </form>

        {isSuccess && (
          <div className="space-y-3 rounded-lg border border-brand-primary/30 bg-brand-primary/5 p-4 text-sm">
            <p className="font-medium text-brand-primary">
              Upload completato con successo per <span className="font-semibold">{state.title}</span>.
            </p>
            {basePath && (
              <p className="text-xs text-muted-foreground">
                Cartella base: <code>{basePath}</code>
              </p>
            )}
            {state.markdown && (
              <AssetRow label="Markdown" asset={state.markdown} />
            )}
            {state.images && state.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Immagini caricate</p>
                <div className="space-y-1">
                  {state.images.map((image) => (
                    <AssetRow key={image.filename} label="Immagine" asset={image} />
                  ))}
                </div>
              </div>
            )}
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
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Caricamento..." : "Carica su Vercel Blob"}
    </Button>
  )
}

function AssetRow({ label, asset }: { label: string; asset: { url: string; filename: string } }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 text-xs">
      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
        {label}
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

function IconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-brand-primary hover:text-brand-primary"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
