import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { Title } from "@/components/ui/title"
import { spacing, typography } from "@/lib/design-system"
import { cn } from "@/lib/utils"

import { UploadImagesForm } from "./upload-images-form"
import { getArticleNameFromPrefix, normalizeArticlesPrefix } from "./utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Carica immagini articolo",
  description: "Aggiungi immagini aggiuntive a un articolo già creato.",
}

interface UploadImagesPageProps {
  searchParams?: { prefix?: string }
}

export default function UploadImagesPage({ searchParams }: UploadImagesPageProps) {
  const rawPrefix = typeof searchParams?.prefix === "string" ? decodeURIComponent(searchParams.prefix) : ""
  const normalizedPrefix = rawPrefix ? normalizeArticlesPrefix(rawPrefix) : null

  if (!normalizedPrefix) {
    return (
      <div className="min-h-screen bg-background">
        <section className={cn(spacing.section, "py-20")}>
          <div className={cn(spacing.containerNarrow, "max-w-2xl space-y-6")}>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-brand-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Torna all'archivio
            </Link>
            <Title as="h1" margin="sm">
              Cartella articolo non valida
            </Title>
            <p className={cn(typography.sectionSubtitle)}>
              Seleziona un articolo dall'archivio e utilizza il pulsante dedicato per caricare nuove immagini.
            </p>
          </div>
        </section>
      </div>
    )
  }

  const articleName = getArticleNameFromPrefix(normalizedPrefix)
  const backHref = `/admin?prefix=${encodeURIComponent(normalizedPrefix)}`

  return (
    <div className="min-h-screen bg-background">
      <section className={cn(spacing.section, "py-20")}>
        <div className={cn(spacing.containerNarrow, "max-w-2xl space-y-6")}>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Torna alla cartella
          </Link>
          <Title as="h1" margin="sm">
            Carica immagini aggiuntive
          </Title>
          <p className={cn(typography.sectionSubtitle)}>
            Aggiungi nuove immagini alla cartella <code>{normalizedPrefix}</code> senza modificare il file Markdown esistente.
          </p>
          <UploadImagesForm prefix={normalizedPrefix} articleName={articleName} />
        </div>
      </section>
    </div>
  )
}
