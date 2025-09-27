"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CategoryHeader } from "@/components/category-header"
import { PostGrid } from "@/components/post-grid"
import { Input } from "@/components/ui/input"
import { getAllPosts } from "@/lib/markdown"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const allPosts = getAllPosts()

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase()

    return allPosts.filter(
      (post) =>
        post.metadata.title.toLowerCase().includes(query) ||
        post.metadata.excerpt.toLowerCase().includes(query) ||
        post.metadata.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        post.metadata.subcategory.toLowerCase().includes(query),
    )
  }, [searchQuery, allPosts])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CategoryHeader title="Cerca" description="Trova gli articoli che ti interessano" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mb-8">
            <Input
              type="search"
              placeholder="Cerca articoli, tag, categorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-center"
            />
          </div>

          {searchQuery.trim() && (
            <div className="mb-6">
              <p className="text-muted-foreground text-center">
                {filteredPosts.length > 0
                  ? `${filteredPosts.length} risultati per "${searchQuery}"`
                  : `Nessun risultato per "${searchQuery}"`}
              </p>
            </div>
          )}

          <PostGrid posts={filteredPosts} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
