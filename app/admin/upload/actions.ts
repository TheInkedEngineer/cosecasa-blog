"use server"

import { currentUser } from "@clerk/nextjs/server"
import { put } from "@vercel/blob"
import type { UploadState, UploadedAsset } from "./state"
import { createSlug, ensureUniqueName, sanitizeFileName } from "./utils"

const MAX_MARKDOWN_SIZE_BYTES = 2 * 1024 * 1024 // 2MB guard for markdown uploads
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB guard per image

export async function uploadMarkdownAction(_: UploadState, formData: FormData): Promise<UploadState> {
  const user = await currentUser()

  if (!user) {
    return { success: false, error: "Non sei autenticato." }
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (!blobToken) {
    return { success: false, error: "Configura la variabile BLOB_READ_WRITE_TOKEN prima di procedere." }
  }

  const rawTitle = formData.get("title")
  const markdownEntry = formData.get("markdown")
  const imageEntries = formData.getAll("images")

  const title = typeof rawTitle === "string" ? rawTitle.trim() : ""

  if (!title) {
    return { success: false, error: "Inserisci un titolo per l'articolo." }
  }

  if (!markdownEntry || !(markdownEntry instanceof File)) {
    return { success: false, error: "Seleziona un file Markdown da caricare." }
  }

  if (markdownEntry.size === 0) {
    return { success: false, error: "Il file Markdown selezionato è vuoto." }
  }

  if (markdownEntry.size > MAX_MARKDOWN_SIZE_BYTES) {
    return { success: false, error: "Il file Markdown è troppo grande. Dimensione massima: 2 MB." }
  }

  const markdownName = markdownEntry.name.trim()
  const isMarkdown =
    markdownEntry.type === "text/markdown" ||
    markdownEntry.type === "text/plain" ||
    markdownName.toLowerCase().endsWith(".md")

  if (!isMarkdown) {
    return { success: false, error: "Sono supportati solo file Markdown (.md)." }
  }

  const imageFiles = imageEntries.filter((value): value is File => value instanceof File && value.size > 0)

  for (const image of imageFiles) {
    if (!image.type.startsWith("image/")) {
      return { success: false, error: "Sono supportati solo file immagine (PNG, JPG, WebP, ecc.)." }
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return { success: false, error: "Una delle immagini supera i 5 MB consentiti." }
    }
  }

  const slug = createSlug(title) || "untitled"
  const basePath = `articles/${slug}`

  const markdownKey = `${basePath}/text.md`

  try {
    const markdownBlob = await put(markdownKey, markdownEntry, {
      access: "public",
      token: blobToken,
    })

    const usedNames = new Set<string>(["text.md"])
    const imageUploads: UploadedAsset[] = []

    for (const image of imageFiles) {
      const sanitizedName = sanitizeFileName(image.name, `image-${imageUploads.length + 1}`)
      const uniqueName = ensureUniqueName(sanitizedName, usedNames)
      const key = `${basePath}/${uniqueName}`
      const blob = await put(key, image, { access: "public", token: blobToken })
      imageUploads.push({ url: blob.url, filename: blob.pathname })
    }

    return {
      success: true,
      title,
      slug,
      markdown: { url: markdownBlob.url, filename: markdownBlob.pathname },
      images: imageUploads.length > 0 ? imageUploads : undefined,
    }
  } catch (error) {
    console.error("Failed to upload assets to Vercel Blob", error)
    return {
      success: false,
      error: "Impossibile caricare i file. Controlla il token BLOB e riprova.",
    }
  }
}
