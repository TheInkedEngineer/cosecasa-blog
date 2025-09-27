import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/markdown"

interface RelatedPostsProps {
  posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-serif text-center mb-12 text-foreground">Articoli correlati</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/${post.metadata.category}/${post.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background h-full">
                <CardContent className="p-0">
                  {post.metadata.image && (
                    <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img
                        src={post.metadata.image || "/placeholder.svg"}
                        alt={post.metadata.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {post.metadata.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.metadata.date).toLocaleDateString("it-IT", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif mb-2 text-foreground group-hover:text-primary transition-colors text-balance">
                      {post.metadata.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3">
                      {post.metadata.excerpt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
