import { UploadForm } from "./upload-form"

import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { Title } from "@/components/ui/title"
import { spacing, typography } from "@/lib/design-system"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Carica Markdown",
  description: "Carica file Markdown su Vercel Blob per archiviarli in modo sicuro.",
}

export default function UploadPage() {
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
            Carica un file Markdown
          </Title>
          <p className={cn(typography.sectionSubtitle)}>
            Compila il titolo dell'articolo, allega il file <code>.md</code> e aggiungi immagini opzionali. Al momento
            dell'upload salveremo tutto in Vercel Blob seguendo la struttura <code>articles/&#123;slug-del-titolo&#125;</code> e ti
            restituiremo i relativi URL.
          </p>
          <UploadForm />
        </div>
      </section>
    </div>
  )
}
