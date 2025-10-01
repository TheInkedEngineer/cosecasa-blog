import { cache } from "react"
import { fetchArticlesFromBlob, extractUniqueTags, type BlobArticle } from "./blob-service"

export interface PostMetadata {
  title: string
  excerpt: string
  date: string
  category: "cose" | "casa" | "persone"
  subcategory: string
  tags: string[]
  image?: string
  author?: string
  featured?: boolean
}

export interface Post {
  slug: string
  metadata: PostMetadata
  content: string
}

// Cache for build-time article fetching
const getCachedArticles = cache(async (): Promise<BlobArticle[]> => {
  return await fetchArticlesFromBlob()
})

/**
 * Map BlobArticle to Post interface
 * Infers category and subcategory from tags
 */
function mapBlobArticleToPost(article: BlobArticle): Post {
  // Try to infer category from tags
  const category = inferCategory(article.tags)
  const subcategory = article.tags[0] || "generale"

  return {
    slug: article.slug,
    metadata: {
      title: article.title,
      excerpt: article.description,
      date: article.date,
      category,
      subcategory,
      tags: article.tags,
      image: article.imageUrl,
      author: "Cosecasa",
      featured: false, // Can be enhanced later by checking a frontmatter field
    },
    content: article.htmlContent,
  }
}

/**
 * Infer category from tags
 * Falls back to "cose" if no category-specific tag is found
 */
function inferCategory(tags: string[]): "cose" | "casa" | "persone" {
  const tagLower = tags.map((t) => t.toLowerCase())

  if (
    tagLower.some((t) =>
      ["casa", "bagno", "cucina", "ristrutturazione", "design", "interior", "architettura"].includes(t),
    )
  ) {
    return "casa"
  }

  if (tagLower.some((t) => ["persone", "ritratti", "incontri", "artigiani"].includes(t))) {
    return "persone"
  }

  return "cose"
}

export async function getPostBySlug(category: string, slug: string): Promise<Post | null> {
  const articles = await getCachedArticles()
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return null
  }

  const post = mapBlobArticleToPost(article)

  // Verify category matches
  if (post.metadata.category !== category) {
    return null
  }

  return post
}

export async function getAllPosts(): Promise<Post[]> {
  const articles = await getCachedArticles()
  return articles.map(mapBlobArticleToPost)
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.metadata.category === category)
}

export async function getPostsBySubcategory(category: string, subcategory: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.metadata.category === category && post.metadata.subcategory === subcategory)
}

export async function getFeaturedPosts(limit = 6): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.metadata.featured).slice(0, limit)
}

export async function getRelatedPosts(currentPost: Post, limit = 3): Promise<Post[]> {
  const allPosts = await getAllPosts()
  const otherPosts = allPosts.filter((post) => post.slug !== currentPost.slug)

  // Find posts with matching tags or same subcategory
  const relatedPosts = otherPosts.filter((post) => {
    const hasMatchingTags = post.metadata.tags.some((tag) => currentPost.metadata.tags.includes(tag))
    const sameSubcategory = post.metadata.subcategory === currentPost.metadata.subcategory

    return hasMatchingTags || sameSubcategory
  })

  // If not enough related posts, fill with posts from same category
  if (relatedPosts.length < limit) {
    const categoryPosts = otherPosts.filter(
      (post) => post.metadata.category === currentPost.metadata.category && !relatedPosts.includes(post),
    )
    relatedPosts.push(...categoryPosts.slice(0, limit - relatedPosts.length))
  }

  return relatedPosts.slice(0, limit)
}

export async function getSubcategories(category: string): Promise<string[]> {
  const posts = await getPostsByCategory(category)
  const subcategories = [...new Set(posts.map((post) => post.metadata.subcategory))]
  return subcategories.sort()
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getCachedArticles()
  return extractUniqueTags(articles)
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.metadata.tags.includes(tag))
}
