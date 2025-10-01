import { listDirectoryContents, getFileContent, getRawFileUrl } from "./github-api"
import { parseMarkdown } from "./markdown-parser"

export interface ArticleRecord {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  htmlContent: string
  imageUrl?: string
}

const IMAGE_PATTERN = /\.(png|jpe?g|webp|gif|svg)$/i

export async function fetchArticlesFromGitHub(): Promise<ArticleRecord[]> {
  const rootEntries = await listDirectoryContents("articles")
  const articleDirs = rootEntries.filter((entry) => entry.type === "dir")

  const articles: ArticleRecord[] = []

  for (const dir of articleDirs) {
    const slug = dir.name

    try {
      const markdownPath = `articles/${slug}/text.md`
      const markdownText = await getFileContent(markdownPath)
      if (!markdownText) {
        continue
      }

      const parsed = await parseMarkdown(markdownText, slug)

      const articleFiles = await listDirectoryContents(`articles/${slug}`)
      const uploadedImages = articleFiles
        .filter((entry) => entry.type === "file" && IMAGE_PATTERN.test(entry.name))
        .map((entry) => getRawFileUrl(entry.path))

      const imageUrl = extractFirstImage(parsed.htmlContent) || uploadedImages[0]

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
      console.error(`Unable to load article ${dir.name}`, error)
    }
  }

  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return articles
}

export function extractUniqueTags(articles: ArticleRecord[]): string[] {
  const tagSet = new Set<string>()

  for (const article of articles) {
    for (const tag of article.tags) {
      tagSet.add(tag)
    }
  }

  return Array.from(tagSet).sort()
}

function extractFirstImage(htmlContent: string): string | undefined {
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i)
  return imgMatch?.[1]
}

