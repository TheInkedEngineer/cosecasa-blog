import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    title: "cose",
    description: "Arte, cultura, oggetti che raccontano storie",
    href: "/cose",
    image: "/elegant-art-gallery.png",
  },
  {
    title: "casa",
    description: "Design, architettura, spazi che ispirano",
    href: "/casa",
    image: "/placeholder-u6csp.png",
  },
  {
    title: "persone",
    description: "Viaggi, incontri, esperienze condivise",
    href: "/persone",
    image: "/placeholder-smx5n.png",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-serif text-center mb-12 text-foreground">Esplora le categorie</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link key={category.title} href={category.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-background">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-serif mb-2 text-primary group-hover:text-foreground transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{category.description}</p>
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
