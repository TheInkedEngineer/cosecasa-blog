import Link from "next/link"

import { FileText, Folder, Image } from "lucide-react"
import { unstable_noStore as noStore } from "next/cache"

import { listDirectoryContents, getRawFileUrl, type RepoContentEntry } from "@/lib/github-api"

import { ArticleDeleteToggle } from "./article-delete-toggle"

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

interface RepoExplorerProps {
  prefix: string
}

export async function RepoExplorer({ prefix }: RepoExplorerProps) {
  noStore()

  const normalizedPrefix = normalizePrefix(prefix)
  const path = normalizedPrefix === "articles/" ? "articles" : normalizedPrefix.replace(/\/$/, "")

  let items: RepoContentEntry[]
  try {
    items = await listDirectoryContents(path)
  } catch (error) {
    console.error("Failed to load repository contents", error)
    return (
      <div className="rounded-xl border border-dashed border-destructive/50 bg-destructive/10 px-6 py-12 text-center text-sm text-destructive">
        Impossibile leggere i file da GitHub. Controlla le variabili <code>GITHUB_*</code> e riprova.
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        Nessun file trovato in questa cartella.
      </div>
    )
  }

  const directories = items.filter((item) => item.type === "dir").sort((a, b) => a.name.localeCompare(b.name))
  const files = items.filter((item) => item.type === "file").sort((a, b) => a.name.localeCompare(b.name))

  const articleSlugMatch = normalizedPrefix.match(/^articles\/([^/]+)\/$/)
  const articleSlug = articleSlugMatch ? articleSlugMatch[1] : null
  const showDeleteAtTop = Boolean(articleSlug)

  const parentPrefix = getParentPrefix(normalizedPrefix)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {showDeleteAtTop ? (
        <div className="flex flex-col gap-2 border-b border-border/70 bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            Stai visualizzando <span className="font-semibold text-foreground">{articleSlug}</span>.
          </p>
          <ArticleDeleteToggle slug={articleSlug!} />
        </div>
      ) : null}
      <ul>
        {parentPrefix ? (
          <li key=".." className="border-b border-border/70">
            <Link
              href={`/admin?prefix=${encodeURIComponent(parentPrefix)}`}
              prefetch={false}
              className="flex flex-col gap-2 px-4 py-4 text-sm transition hover:bg-muted sm:grid sm:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)] sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">⬅︎ Torna alla cartella superiore</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block sm:text-right">—</span>
            </Link>
          </li>
        ) : null}
        {directories.map((dir) => {
          const nextPrefix = `${normalizedPrefix}${dir.name}/`
          const showDeleteButton = normalizedPrefix === "articles/"
          return (
            <li key={`dir-${dir.path}`} className="border-b border-border/70">
              <div className="flex flex-col gap-3 px-4 py-4 text-sm sm:grid sm:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)] sm:items-center sm:gap-4 sm:px-6">
                <Link
                  href={`/admin?prefix=${encodeURIComponent(nextPrefix)}`}
                  prefetch={false}
                  className="flex flex-col gap-1 text-left transition hover:text-brand-primary"
                >
                  <span className="truncate font-semibold text-foreground" title={dir.name}>
                    <Folder className="mr-2 inline-block h-4 w-4" aria-hidden="true" /> {dir.name}
                  </span>
                  <span className="text-xs text-muted-foreground">Apri cartella</span>
                </Link>
                <span className="hidden text-xs text-muted-foreground sm:block sm:text-right">—</span>
                <div className="flex justify-end sm:justify-end">
                  {showDeleteButton ? <ArticleDeleteToggle slug={dir.name} /> : <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </div>
            </li>
          )
        })}
        {files.map((file) => {
          const isMarkdown = file.name.toLowerCase() === "text.md"
          const icon = isMarkdown ? <FileText className="h-4 w-4" aria-hidden="true" /> : <Image className="h-4 w-4" aria-hidden="true" />
          const rawUrl = getRawFileUrl(file.path)
          return (
            <li key={`file-${file.path}`} className="border-b border-border/70">
              <div className="flex flex-col gap-3 px-4 py-4 text-sm sm:grid sm:grid-cols-[minmax(0,6fr)_minmax(0,2fr)_minmax(0,2fr)] sm:items-center sm:gap-4 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground" title={file.name}>
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                      {icon}
                    </span>
                    {file.name}
                  </p>
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-primary underline-offset-4 hover:underline"
                  >
                    Apri file su GitHub Raw
                  </a>
                </div>
                <span className="text-xs text-muted-foreground sm:text-right">{formatSize(file.size)}</span>
                <span className="text-xs text-muted-foreground sm:text-right">—</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function normalizePrefix(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed || !trimmed.startsWith("articles")) {
    return "articles/"
  }
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`
}

function getParentPrefix(prefix: string): string | null {
  const normalized = normalizePrefix(prefix)
  const segments = normalized.split("/").filter(Boolean)
  if (segments.length <= 1) {
    return null
  }
  const parentSegments = segments.slice(0, -1)
  if (parentSegments.length === 0) {
    return "articles/"
  }
  return `${parentSegments.join("/")}/`
}
