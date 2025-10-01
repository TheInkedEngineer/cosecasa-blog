"use client"

import { useFormState, useFormStatus } from "react-dom"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { deleteArticleAction } from "./actions"
import { initialDeleteArticleState, type DeleteArticleState } from "./state"

interface DeleteArticleFormProps {
  prefix: string
}

export function DeleteArticleForm({ prefix }: DeleteArticleFormProps) {
  const [state, formAction] = useFormState<DeleteArticleState, FormData>(
    deleteArticleAction,
    initialDeleteArticleState,
  )

  return (
    <form
      action={formAction}
      className="flex flex-col items-end gap-2 md:items-center md:justify-self-end"
    >
      <input type="hidden" name="prefix" value={prefix} />
      <DeleteButton />
      {state?.error ? (
        <p className="text-[11px] text-destructive">{state.error}</p>
      ) : null}
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
      {pending ? "Eliminazione..." : "Elimina articolo"}
    </Button>
  )
}
