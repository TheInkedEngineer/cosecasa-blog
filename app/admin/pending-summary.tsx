"use client"

import Link from "next/link"

import { AlertTriangle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { usePendingChanges } from "./pending-changes-context"

export function PendingSummary() {
  const { state, hasPending, storageUsed, storageLimit, isReady, clearAll } = usePendingChanges()

  if (!isReady) {
    return null
  }

  const uploads = state.uploads
  const deletes = state.deletes
  const imageDeletes = state.imageDeletes

  const handleDiscard = () => {
    if (window.confirm("Vuoi davvero scartare tutte le modifiche non pubblicate?")) {
      clearAll()
    }
  }

  if (!hasPending) {
    return (
      <Card className="border-dashed border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          <span>Non ci sono modifiche in sospeso. Carica un nuovo articolo per iniziare.</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/upload">Nuovo articolo</Link>
          </Button>
        </div>
      </Card>
    )
  }

  const totalImages = uploads.reduce((total, upload) => total + (upload.images?.length ?? 0), 0)
  const usagePercent = Math.min(100, Math.round((storageUsed / storageLimit) * 100))

  return (
    <Card className="space-y-4 border border-border/60 bg-muted/20 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
        <p className="text-sm text-foreground">
          Hai modifiche non pubblicate. Ricordati di premere <span className="font-semibold">"Pubblica"</span> per creare il commit su GitHub.
        </p>
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>• {uploads.length} articoli da aggiungere o aggiornare</li>
        <li>• {deletes.length} articoli da eliminare</li>
        <li>• {totalImages} immagini da caricare</li>
        <li>• {imageDeletes.length} immagini da eliminare</li>
        <li>• Spazio locale: {formatBytes(storageUsed)} / {formatBytes(storageLimit)} ({usagePercent}%)</li>
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-xs text-muted-foreground">Scarta tutto per ripartire da zero.</span>
        <Button variant="destructive" size="sm" onClick={handleDiscard}>Scarta modifiche</Button>
      </div>
    </Card>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
