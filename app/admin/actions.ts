"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export interface DeleteState {
  success?: boolean
  error?: string
}

export const initialDeleteState: DeleteState = {}

export async function deleteBlobAction(_: DeleteState, formData: FormData): Promise<DeleteState> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return { error: "Token BLOB mancante." }
  }

  const pathname = formData.get("pathname")

  if (!pathname || typeof pathname !== "string") {
    return { error: "Percorso non valido." }
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
