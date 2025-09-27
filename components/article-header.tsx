import { Badge } from "@/components/ui/badge"

interface ArticleHeaderProps {
  title: string
  image?: string
  category: string
}

export function ArticleHeader({ title, image, category }: ArticleHeaderProps) {
  return (
    <header className="relative">
      {image && (
        <div className="aspect-[21/9] md:aspect-[21/7] overflow-hidden">
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className={image ? "relative -mt-32 z-10" : ""}>
          <div className={`${image ? "bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-lg" : ""}`}>
            <Badge variant="secondary" className="mb-4 capitalize">
              {category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-serif text-balance text-foreground leading-tight">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  )
}
