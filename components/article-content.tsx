interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-serif prose-headings:text-foreground
        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
        prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
        prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-em:text-foreground prose-em:italic
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-ul:text-foreground prose-ol:text-foreground
        prose-li:text-foreground prose-li:mb-1
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
        prose-hr:border-border prose-hr:my-8
        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-muted prose-pre:border prose-pre:border-border"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
