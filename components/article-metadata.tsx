import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag } from "lucide-react"
import Link from "next/link"
import type { PostMetadata } from "@/lib/markdown"

interface ArticleMetadataProps {
  metadata: PostMetadata
}

export function ArticleMetadata({ metadata }: ArticleMetadataProps) {
  return (
    <div className="border-b border-border pb-6 mb-8">
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <time dateTime={metadata.date}>
            {new Date(metadata.date).toLocaleDateString("it-IT", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        {metadata.author && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{metadata.author}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <Badge variant="outline" className="text-xs capitalize">
            {metadata.subcategory}
          </Badge>
        </div>
      </div>

      <p className="text-lg text-muted-foreground leading-relaxed text-balance">{metadata.excerpt}</p>

      {metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {metadata.tags.map((tag) => (
            <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
              <Badge
                variant="outline"
                className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
