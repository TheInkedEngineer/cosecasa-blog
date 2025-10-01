import matter from "gray-matter"
import { remark } from "remark"
import remarkParse from "remark-parse"
import remarkHtml from "remark-html"
import sanitizeHtml from "sanitize-html"

import { getRawFileUrl } from "./github-api"

export interface ParsedMarkdown {
  frontmatter: {
    title: string
    date: string
    description: string
    tags: string[]
  }
  htmlContent: string
  rawContent: string
}

/**
 * Parse a Markdown file with YAML frontmatter
 * Extracts metadata and converts Markdown to sanitized HTML
 */
export async function parseMarkdown(markdownText: string, slug: string): Promise<ParsedMarkdown> {
  // Parse frontmatter using gray-matter
  const { data, content } = matter(markdownText)

  // Extract and parse tags from comma-separated string
  const tagsRaw = data.tags || ""
  const tags = typeof tagsRaw === "string"
    ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
    : Array.isArray(tagsRaw)
    ? tagsRaw
    : []

  // Replace relative image paths with full GitHub raw URLs
  const contentWithResolvedImages = resolveImagePaths(content, slug)

  // Convert Markdown to HTML using remark
  const processedContent = await remark()
    .use(remarkParse)
    .use(remarkHtml, { sanitize: false }) // We'll sanitize separately for more control
    .process(contentWithResolvedImages)

  const rawHtml = String(processedContent)

  // Sanitize HTML to prevent XSS
  const htmlContent = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  })

  return {
    frontmatter: {
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      description: data.description || "",
      tags,
    },
    htmlContent,
    rawContent: content,
  }
}

/**
 * Replace relative image paths with full GitHub raw URLs
 * Converts: ![alt](/image.png) -> ![alt](https://raw.githubusercontent.com/.../articles/slug/image.png)
 */
function resolveImagePaths(content: string, slug: string): string {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g

  return content.replace(imageRegex, (match, alt, path) => {
    if (isRelativePath(path)) {
      const normalized = normalizeRelativePath(path)
      const imageUrl = ghRawUrl(slug, normalized)
      return `![${alt}](${imageUrl})`
    }

    return match
  })
}

function isRelativePath(path: string): boolean {
  return path.startsWith("./") || path.startsWith("../") || path.startsWith("/") || !/^https?:/i.test(path)
}

function normalizeRelativePath(path: string): string {
  if (path.includes("..")) {
    throw new Error("Path traversal rilevato nelle immagini dell'articolo.")
  }

  const withoutLeading = path.replace(/^\.+\/+/, "").replace(/^\/+/, "")
  const normalized = withoutLeading.replace(/\\/g, "/")

  return normalized
}

function ghRawUrl(slug: string, filename: string): string {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "")

  if (!cleanSlug) {
    throw new Error("Slug articolo non valido per la generazione dell'URL GitHub.")
  }

  const cleanFile = filename.replace(/\\/g, "/").replace(/^\/+/, "")

  if (!cleanFile || cleanFile.includes("..")) {
    throw new Error("Percorso immagine non valido per GitHub Raw.")
  }

  return getRawFileUrl(`articles/${cleanSlug}/${cleanFile}`)
}
