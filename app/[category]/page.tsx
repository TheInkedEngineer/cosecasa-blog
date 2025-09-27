import { notFound } from "next/navigation"
import { getPostsByCategory, getSubcategories } from "@/lib/markdown"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CategoryHeader } from "@/components/category-header"
import { PostGrid } from "@/components/post-grid"
import { SubcategoryFilter } from "@/components/subcategory-filter"

const categoryInfo = {
  cose: {
    title: "Cose",
    description: "Arte, cultura, oggetti che raccontano storie di bellezza e significato",
  },
  casa: {
    title: "Casa",
    description: "Design, architettura, spazi che ispirano e accolgono",
  },
  persone: {
    title: "Persone",
    description: "Viaggi, incontri, esperienze che arricchiscono l'anima",
  },
}

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    subcategory?: string
  }
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = params
  const { subcategory } = searchParams

  if (!["cose", "casa", "persone"].includes(category)) {
    notFound()
  }

  const posts = getPostsByCategory(category)
  const subcategories = getSubcategories(category)
  const info = categoryInfo[category as keyof typeof categoryInfo]

  // Filter posts by subcategory if specified
  const filteredPosts = subcategory ? posts.filter((post) => post.metadata.subcategory === subcategory) : posts

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CategoryHeader title={info.title} description={info.description} />
        <div className="container mx-auto px-4 py-8">
          <SubcategoryFilter category={category} subcategories={subcategories} currentSubcategory={subcategory} />
          <PostGrid posts={filteredPosts} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export function generateStaticParams() {
  return [{ category: "cose" }, { category: "casa" }, { category: "persone" }]
}
