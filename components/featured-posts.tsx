import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFeaturedPosts } from "@/lib/markdown"

export function FeaturedPosts() {
  const featuredPosts = getFeaturedPosts(3)

  if (featuredPosts.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12 text-foreground">Articoli in evidenza</h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nessun articolo in evidenza al momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-serif text-center mb-12 text-foreground">Articoli in evidenza</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuredPosts.map((post) => (
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
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
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
                    <h3 className="text-xl font-serif mb-3 text-foreground group-hover:text-primary transition-colors text-balance">
                      {post.metadata.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm flex-grow">{post.metadata.excerpt}</p>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {post.metadata.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
