"use client"

import { useFormState, useFormStatus } from "react-dom"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { deleteBlobAction } from "./actions"
import { initialDeleteState, type DeleteState } from "./state"

export function DeleteBlobForm({ pathname }: { pathname: string }) {
  const [state, formAction] = useFormState<DeleteState, FormData>(deleteBlobAction, initialDeleteState)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="pathname" value={pathname} />
      <DeleteButton />
      {state?.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      className="inline-flex items-center gap-2"
      disabled={pending}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      {pending ? "Eliminazione..." : "Elimina"}
    </Button>
  )
}
