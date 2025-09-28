import Link from "next/link"

import { list } from "@vercel/blob"

import { DeleteBlobForm } from "./delete-blob-form"

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input
  return date.toLocaleString("it-IT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
      <div className="hidden bg-muted px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto_auto] md:gap-4">
        <span>Elemento</span>
        <span>Dimensione</span>
        <span>Ultimo upload</span>
        <span className="sr-only">Azioni</span>
      </div>
      <ul>
        {parentPrefix !== null && (
          <li key=".." className="border-t border-border/70">
            <Link
              href={parentPrefix ? `/admin?prefix=${encodeURIComponent(parentPrefix)}` : "/admin"}
              className="flex flex-col gap-2 px-4 py-4 text-sm transition hover:bg-muted md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto_auto] md:items-center md:gap-4 md:px-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">⬅︎ Torna alla cartella superiore</p>
              </div>
              <span className="text-xs text-muted-foreground">—</span>
              <span className="text-xs text-muted-foreground">—</span>
              <span className="text-xs text-brand-primary underline-offset-4">Apri</span>
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
                className="flex flex-col gap-2 px-4 py-4 text-sm transition hover:bg-muted md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto_auto] md:items-center md:gap-4 md:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground" title={folder}>
                    📁 {folder}
                  </p>
                  <span className="text-xs text-muted-foreground">Apri cartella</span>
                </div>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-brand-primary underline-offset-4">Apri</span>
              </Link>
            </li>
          )
        })}
        {sortedFiles.map((blob) => (
          <li key={blob.pathname} className="border-t border-border/70">
            <div className="flex flex-col gap-3 px-4 py-4 text-sm md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto_auto] md:items-center md:gap-4 md:px-6">
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
              <span className="text-xs text-muted-foreground">{formatSize(blob.size)}</span>
              <span className="text-xs text-muted-foreground">{formatDate(blob.uploadedAt)}</span>
              <DeleteBlobForm pathname={blob.pathname} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
