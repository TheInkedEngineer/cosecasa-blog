interface CategoryHeaderProps {
  title: string
  description: string
}

export function CategoryHeader({ title, description }: CategoryHeaderProps) {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">{title}</h1>
        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">{description}</p>
      </div>
    </section>
  )
}
