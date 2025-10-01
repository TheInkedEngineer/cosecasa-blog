"use server"

import { del, list } from "@vercel/blob"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect"
import type { DeleteArticleState, DeleteState } from "./state"
import { normalizeArticlesPrefix } from "./upload-images/utils"

export async function deleteBlobAction(_: DeleteState, formData: FormData): Promise<DeleteState> {
  const user = await currentUser()

  if (!user) {
    return { error: "Non sei autenticato." }
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return { error: "Token BLOB mancante." }
  }

  const pathname = formData.get("pathname")

  if (!pathname || typeof pathname !== "string") {
    return { error: "Percorso non valido." }
  }

  if (pathname.split("/").pop() === "text.md") {
    return { error: "Non puoi eliminare il file text.md di un articolo." }
  }

  try {
    await del(pathname, { token })
    revalidatePath("/admin", "page")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete blob", error)
    return { error: "Impossibile eliminare il file. Riprova." }
  }
}

export async function deleteArticleAction(
  _: DeleteArticleState,
  formData: FormData,
): Promise<DeleteArticleState> {
  const user = await currentUser()

  if (!user) {
    return { error: "Non sei autenticato." }
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return { error: "Token BLOB mancante." }
  }

  const prefixEntry = formData.get("prefix")

  if (!prefixEntry || typeof prefixEntry !== "string") {
    return { error: "Percorso non valido." }
  }

  const normalizedPrefix = normalizeArticlesPrefix(prefixEntry)

  if (!normalizedPrefix) {
    return { error: "Puoi eliminare solo cartelle articolo valide." }
  }

  try {
    const allBlobs = await collectAllBlobs(normalizedPrefix, token)

    const hasTextFile = allBlobs.some((blob) => blob.pathname === `${normalizedPrefix}text.md`)

    if (!hasTextFile) {
      return { error: "La cartella selezionata non contiene un file text.md." }
    }

    for (const blob of allBlobs) {
      await del(blob.pathname, { token })
    }

    revalidatePath("/admin", "page")

    const parentPrefix = normalizedPrefix.replace(/[^/]+\/$/, "")
    const redirectTo = parentPrefix ? `/admin?prefix=${encodeURIComponent(parentPrefix)}` : "/admin"

    redirect(redirectTo)
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error("Failed to delete article folder", error)
    return { error: "Impossibile eliminare l'articolo. Riprova più tardi." }
  }
}

async function collectAllBlobs(prefix: string, token: string) {
  const blobs = [] as Awaited<ReturnType<typeof list>>["blobs"]
  let cursor: string | undefined

  do {
    const result = await list({ token, prefix, cursor, limit: 100 })
    blobs.push(...result.blobs)
    cursor = result.cursor
  } while (cursor)

  return blobs
}
