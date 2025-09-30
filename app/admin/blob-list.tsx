import Link from "next/link"

import { ImagePlus } from "lucide-react"
import { list } from "@vercel/blob"

import { DeleteBlobForm } from "./delete-blob-form"
import { DeleteArticleForm } from "./delete-article-form"

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

interface BlobListProps {
  prefix: string
}

export async function BlobList({ prefix }: BlobListProps) {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return (
      <div className="rounded-xl border border-dashed border-destructive/50 bg-destructive/10 px-6 py-12 text-center text-sm text-destructive">
        La variabile <code>BLOB_READ_WRITE_TOKEN</code> non è configurata. Impostala per visualizzare l'elenco dei file.
      </div>
    )
  }

  const normalizedPrefix = prefix
  const { blobs } = await list({ limit: 200, token, prefix: normalizedPrefix })

  const folders = new Set<string>()
  const files: typeof blobs = []

  blobs.forEach((blob) => {
    const relative = normalizedPrefix ? blob.pathname.slice(normalizedPrefix.length) : blob.pathname
    if (!relative) return
    const segments = relative.split("/")
    if (segments.length > 1) {
      folders.add(segments[0])
      return
    }
    files.push(blob)
  })

  const sortedFolders = Array.from(folders).sort((a, b) => a.localeCompare(b))
  const sortedFiles = [...files].sort((a, b) => a.pathname.localeCompare(b.pathname))

  const showUploadImagesButton =
    normalizedPrefix.startsWith("articles/") &&
    sortedFiles.some((blob) => blob.pathname === `${normalizedPrefix}text.md`)

  const showDeleteArticleButton = showUploadImagesButton && normalizedPrefix !== "articles/"

  const uploadImagesHref = showUploadImagesButton
    ? `/admin/upload-images?prefix=${encodeURIComponent(normalizedPrefix)}`
    : null

  if (!sortedFolders.length && !sortedFiles.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        La cartella è vuota. Carica nuovi file o torna alla directory precedente.
      </div>
    )
  }

  const parentPrefix = normalizedPrefix
    ? normalizedPrefix.replace(/[^/]+\/$/, "")
    : null

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="hidden items-center gap-4 bg-muted px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)]">
        <span>Elemento</span>
        <span className="text-right">DIMENSIONE</span>
        {showDeleteArticleButton ? (
          <div className="flex justify-end md:justify-self-end">
            <DeleteArticleForm prefix={normalizedPrefix} />
          </div>
        ) : (
          <span className="sr-only">Azioni</span>
        )}
      </div>
      {showDeleteArticleButton ? (
        <div className="flex justify-end border-b border-border/70 px-4 py-3 md:hidden">
          <DeleteArticleForm prefix={normalizedPrefix} />
        </div>
      ) : null}
      <ul>
        {parentPrefix !== null && (
          <li key=".." className="border-t border-border/70">
            <Link
              href={parentPrefix ? `/admin?prefix=${encodeURIComponent(parentPrefix)}` : "/admin"}
              className="flex flex-col gap-2 px-4 py-4 text-sm transition hover:bg-muted md:grid md:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)] md:items-center md:gap-4 md:px-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">⬅︎ Torna alla cartella superiore</p>
              </div>
            </Link>
          </li>
        )}
        {sortedFolders.map((folder) => {
          const nextPrefix = `${normalizedPrefix}${folder}/`
          const href = `/admin?prefix=${encodeURIComponent(nextPrefix)}`
          return (
            <li key={`dir-${folder}`} className="border-t border-border/70">
              <Link
                href={href}
                className="flex flex-col gap-2 px-4 py-4 text-sm transition hover:bg-muted md:grid md:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)] md:items-center md:gap-4 md:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground" title={folder}>
                    📁 {folder}
                  </p>
                  <span className="text-xs text-muted-foreground">Apri cartella</span>
                </div>
                <span className="text-xs text-muted-foreground text-right md:justify-self-end">—</span>
                <span className="text-xs text-brand-primary underline-offset-4">Apri</span>
              </Link>
            </li>
          )
        })}
        {sortedFiles.map((blob) => (
          <li key={blob.pathname} className="border-t border-border/70">
            <div className="flex flex-col gap-3 px-4 py-4 text-sm md:grid md:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)] md:items-center md:gap-4 md:px-6">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground" title={blob.pathname}>
                  {normalizedPrefix ? blob.pathname.slice(normalizedPrefix.length) : blob.pathname}
                </p>
                <a
                  href={blob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-primary underline-offset-4 hover:underline"
                >
                  Apri file
                </a>
              </div>
              <span className="text-xs text-muted-foreground text-right md:justify-self-end">
                {formatSize(blob.size)}
              </span>
              {(() => {
                const relativeName = normalizedPrefix
                  ? blob.pathname.slice(normalizedPrefix.length)
                  : blob.pathname
                if (relativeName === "text.md") {
                  return <span className="text-xs text-muted-foreground text-right md:justify-self-end">—</span>
                }
                return (
                  <div className="flex justify-end md:justify-self-end">
                    <DeleteBlobForm pathname={blob.pathname} />
                  </div>
                )
              })()}
            </div>
          </li>
        ))}
      </ul>
      {uploadImagesHref ? (
        <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/30 px-4 py-4 text-sm md:flex-row md:items-center md:justify-between md:px-6">
          <p className="text-xs text-muted-foreground md:text-sm">
            Aggiungi nuove immagini a questo articolo mantenendo intatti i file esistenti.
          </p>
          <Link
            href={uploadImagesHref}
            className="inline-flex items-center gap-2 self-start rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary-foreground shadow-sm transition hover:bg-brand-primary/90 md:self-auto"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Carica altre immagini
          </Link>
        </div>
      ) : null}
    </div>
  )
}
