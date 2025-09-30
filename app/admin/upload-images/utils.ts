export function normalizeArticlesPrefix(rawPrefix: string): string | null {
  const trimmed = rawPrefix.trim()
  if (!trimmed) return null

  const cleaned = trimmed.replace(/^\/+/, "")
  if (!cleaned.startsWith("articles/")) {
    return null
  }

  const segments = cleaned.split("/").filter((segment) => segment.length > 0)
  if (segments.length < 2) {
    return null
  }

  for (const segment of segments) {
    if (segment === "..") {
      return null
    }
  }

  return `${segments.join("/")}/`
}

export function getArticleNameFromPrefix(prefix: string): string {
  const withoutTrailingSlash = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix
  const segments = withoutTrailingSlash.split("/")
  return segments[segments.length - 1] ?? "articolo"
}
