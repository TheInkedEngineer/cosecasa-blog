"use client"

import { useState, useMemo } from "react"
import { articles, categories } from "@/lib/content"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function HomePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const filteredArticles = useMemo(() => {
    if (selectedCategories.length === 0) return articles
    return articles.filter((article) => article.categories.some((category) => selectedCategories.includes(category)))
  }, [selectedCategories])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const latestArticles = filteredArticles.slice(0, 3)
  const remainingArticles = filteredArticles.slice(3)

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6">cosecasa.it</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Storie di bellezza, cultura e vita quotidiana. Un diario personale dove condivido le mie passioni per
            l'arte, i viaggi, il design e tutto ciò che rende la vita più bella.
          </p>
        </div>
      </section>

      <section className="px-4 py-8 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category)}
                className="text-sm"
              >
                #{category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {filteredArticles.length > 0 && (
            <>
              {/* Latest section */}
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold mb-8 text-center">Ultimi Articoli</h2>

                {/* First article - full width */}
                {latestArticles[0] && (
                  <Card className="mb-6 overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/2">
                        <Image
                          src={latestArticles[0].image || "/placeholder.svg"}
                          alt={latestArticles[0].title}
                          width={600}
                          height={400}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                      <CardContent className="md:w-1/2 p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {latestArticles[0].categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              #{cat}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-serif text-2xl font-bold mb-3">{latestArticles[0].title}</h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{latestArticles[0].excerpt}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(latestArticles[0].date).toLocaleDateString("it-IT", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                )}

                {/* Second and third articles - side by side */}
                {latestArticles.length > 1 && (
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {latestArticles.slice(1, 3).map((article) => (
                      <Card key={article.id} className="overflow-hidden">
                        <Image
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          width={400}
                          height={250}
                          className="w-full h-48 object-cover"
                        />
                        <CardContent className="p-4">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {article.categories.map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                #{cat}
                              </Badge>
                            ))}
                          </div>
                          <h3 className="font-serif text-lg font-bold mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(article.date).toLocaleDateString("it-IT", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Remaining articles in grid */}
              {remainingArticles.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {remainingArticles.map((article) => (
                    <Card key={article.id} className="overflow-hidden">
                      <Image
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {article.categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              #{cat}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-serif text-base font-bold mb-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(article.date).toLocaleDateString("it-IT", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nessun articolo trovato per le categorie selezionate.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
