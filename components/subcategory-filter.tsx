"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface SubcategoryFilterProps {
  category: string
  subcategories: string[]
  currentSubcategory?: string
}

export function SubcategoryFilter({ category, subcategories, currentSubcategory }: SubcategoryFilterProps) {
  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Link href={`/${category}`}>
          <Badge
            variant={!currentSubcategory ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Tutti
          </Badge>
        </Link>
        {subcategories.map((subcategory) => (
          <Link key={subcategory} href={`/${category}?subcategory=${encodeURIComponent(subcategory)}`}>
            <Badge
              variant={currentSubcategory === subcategory ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors capitalize"
            >
              {subcategory}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
