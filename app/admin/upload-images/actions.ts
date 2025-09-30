"use server"

import { currentUser } from "@clerk/nextjs/server"
import { list, put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

import type { UploadImagesState } from "./state"
import { ensureUniqueName, sanitizeFileName } from "../upload/utils"
import { normalizeArticlesPrefix } from "./utils"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export async function uploadArticleImagesAction(
  _: UploadImagesState,
  formData: FormData,
): Promise<UploadImagesState> {
  const user = await currentUser()

  if (!user) {
    return { success: false, error: "Non sei autenticato." }
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return { success: false, error: "Configura la variabile BLOB_READ_WRITE_TOKEN prima di procedere." }
  }

  const prefixEntry = formData.get("prefix")

  if (!prefixEntry || typeof prefixEntry !== "string") {
    return { success: false, error: "Percorso non valido." }
  }

  const normalizedPrefix = normalizeArticlesPrefix(prefixEntry)

  if (!normalizedPrefix) {
    return { success: false, error: "Puoi caricare immagini solo nelle cartelle articolo valide." }
  }

  const imageEntries = formData.getAll("images")
  const imageFiles = imageEntries.filter((value): value is File => value instanceof File && value.size > 0)

  if (imageFiles.length === 0) {
    return { success: false, error: "Seleziona almeno un file immagine da caricare." }
  }

  for (const image of imageFiles) {
    if (!image.type.startsWith("image/")) {
      return { success: false, error: "Sono supportati solo file immagine (PNG, JPG, WebP, ecc.)." }
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return { success: false, error: "Una delle immagini supera i 5 MB consentiti." }
    }
  }

  try {
    const { blobs } = await list({ token, prefix: normalizedPrefix, limit: 200 })
    const hasTextFile = blobs.some((blob) => blob.pathname === `${normalizedPrefix}text.md`)

    if (!hasTextFile) {
      return {
        success: false,
        error: "La cartella selezionata non contiene un file text.md necessario per identificare l'articolo.",
      }
    }

    const usedNames = new Set<string>(
      blobs.map((blob) => blob.pathname.slice(normalizedPrefix.length)).filter((name) => Boolean(name)),
    )
    const uploadedImages = [] as NonNullable<UploadImagesState["images"]>

    for (const image of imageFiles) {
      const fallbackName = `image-${uploadedImages.length + 1}`
      const sanitizedName = sanitizeFileName(image.name, fallbackName)
      const uniqueName = ensureUniqueName(sanitizedName, usedNames)
      const key = `${normalizedPrefix}${uniqueName}`
      const blob = await put(key, image, { access: "public", token })
      uploadedImages.push({ url: blob.url, filename: blob.pathname })
    }

    revalidatePath("/admin", "page")

    return {
      success: true,
      prefix: normalizedPrefix,
      images: uploadedImages,
    }
  } catch (error) {
    console.error("Failed to upload images to Vercel Blob", error)
    return {
      success: false,
      error: "Impossibile caricare le immagini. Riprova più tardi.",
    }
  }
}
