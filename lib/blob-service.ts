import { list } from "@vercel/blob"
import { parseMarkdown } from "./markdown-parser"

export interface BlobArticle {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  htmlContent: string
  imageUrl?: string
}

interface BlobFile {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

/**
 * Fetch all articles from Vercel Blob at build time
 * Scans the articles/ folder, finds text.md files, and parses them
 */
export async function fetchArticlesFromBlob(): Promise<BlobArticle[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    console.warn("BLOB_READ_WRITE_TOKEN not set. Returning empty articles array.")
    return []
  }

  try {
    // Get base URL from first blob (all blobs share the same domain)
    const firstBlob = await list({ token, limit: 1 })
    const blobBaseUrl = firstBlob.blobs[0]?.url
      ? new URL(firstBlob.blobs[0].url).origin
      : ""

    // List all files in articles/ prefix
    const allBlobs: BlobFile[] = []
    let cursor: string | undefined

    do {
      const result = await list({
        token,
        prefix: "articles/",
        cursor,
        limit: 1000,
      })

      allBlobs.push(...result.blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })))

      cursor = result.cursor
    } while (cursor)

    // Group files by article slug (articles/slug-name/file.ext)
    const articleMap = new Map<string, { textMdUrl?: string; images: string[] }>()

    for (const blob of allBlobs) {
      const match = blob.pathname.match(/^articles\/([^/]+)\/(.+)$/)
      if (!match) continue

      const [, slug, filename] = match

      if (!articleMap.has(slug)) {
        articleMap.set(slug, { images: [] })
      }

      const article = articleMap.get(slug)!

      if (filename === "text.md") {
        article.textMdUrl = blob.url
      } else if (filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        article.images.push(blob.url)
      }
    }

    // Parse each article's text.md file
    const articles: BlobArticle[] = []

    for (const [slug, { textMdUrl, images }] of articleMap.entries()) {
      if (!textMdUrl) {
        console.warn(`Skipping article ${slug}: no text.md found`)
        continue
      }

      try {
        // Fetch the Markdown content
        const response = await fetch(textMdUrl)
        if (!response.ok) {
          console.error(`Failed to fetch ${textMdUrl}: ${response.statusText}`)
          continue
        }

        const markdownText = await response.text()

        // Parse the Markdown
        const parsed = await parseMarkdown(markdownText, slug, blobBaseUrl)

        // Extract first image from content or use first uploaded image
        const imageUrl = extractFirstImage(parsed.htmlContent) || images[0]

        articles.push({
          slug,
          title: parsed.frontmatter.title,
          date: parsed.frontmatter.date,
          description: parsed.frontmatter.description,
          tags: parsed.frontmatter.tags,
          htmlContent: parsed.htmlContent,
          imageUrl,
        })
      } catch (error) {
        console.error(`Error parsing article ${slug}:`, error)
      }
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return articles
  } catch (error) {
    console.error("Error fetching articles from Vercel Blob:", error)
    return []
  }
}

/**
 * Extract the first image URL from HTML content
 */
function extractFirstImage(htmlContent: string): string | undefined {
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i)
  return imgMatch?.[1]
}

/**
 * Get unique tags from all articles
 */
export function extractUniqueTags(articles: BlobArticle[]): string[] {
  const tagSet = new Set<string>()

  for (const article of articles) {
    for (const tag of article.tags) {
      tagSet.add(tag)
    }
  }

  return Array.from(tagSet).sort()
}
