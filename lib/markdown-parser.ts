import matter from "gray-matter"
import { remark } from "remark"
import remarkParse from "remark-parse"
import remarkHtml from "remark-html"
import sanitizeHtml from "sanitize-html"

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
export async function parseMarkdown(
  markdownText: string,
  slug: string,
  blobBaseUrl: string = "",
): Promise<ParsedMarkdown> {
  // Parse frontmatter using gray-matter
  const { data, content } = matter(markdownText)

  // Extract and parse tags from comma-separated string
  const tagsRaw = data.tags || ""
  const tags = typeof tagsRaw === "string"
    ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
    : Array.isArray(tagsRaw)
    ? tagsRaw
    : []

  // Replace relative image paths with full Blob URLs
  const contentWithResolvedImages = resolveImagePaths(content, slug, blobBaseUrl)

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
 * Replace relative image paths with full Blob URLs
 * Converts: ![alt](/image.png) -> ![alt](https://blob-url/articles/slug/image.png)
 */
function resolveImagePaths(content: string, slug: string, blobBaseUrl: string): string {
  if (!blobBaseUrl) {
    return content
  }

  // Match Markdown image syntax: ![alt](path)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g

  return content.replace(imageRegex, (match, alt, path) => {
    // Only replace relative paths (starting with / or ./)
    if (path.startsWith("/") || path.startsWith("./")) {
      const cleanPath = path.replace(/^\.?\//, "") // Remove leading / or ./
      const fullUrl = `${blobBaseUrl}/articles/${slug}/${cleanPath}`
      return `![${alt}](${fullUrl})`
    }
    // Keep absolute URLs unchanged
    return match
  })
}
