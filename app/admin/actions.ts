"use server"

import { del } from "@vercel/blob"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import type { DeleteState } from "./state"

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

  try {
    await del(pathname, { token })
    revalidatePath("/admin", "page")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete blob", error)
    return { error: "Impossibile eliminare il file. Riprova." }
  }
}
