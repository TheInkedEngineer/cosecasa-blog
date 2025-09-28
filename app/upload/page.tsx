import { UploadForm } from "./upload-form"

import { Title } from "@/components/ui/title"
import { spacing, typography } from "@/lib/design-system"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Carica Markdown",
  description: "Carica file Markdown su Vercel Blob per archiviarli in modo sicuro.",
}

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className={cn(spacing.section, "py-20")}>
        <div className={cn(spacing.containerNarrow, "max-w-2xl space-y-6")}>
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
