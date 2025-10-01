import Link from "next/link"

import { Plus, Home } from "lucide-react"

import { Title } from "@/components/ui/title"
import { spacing, typography } from "@/lib/design-system"
import { cn } from "@/lib/utils"

import { BlobList } from "./blob-list"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Pannello amministrazione",
  description: "Gestisci gli asset salvati su Vercel Blob.",
}

interface AdminDashboardPageProps {
  searchParams?: { prefix?: string }
}

export default function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const rawPrefix = searchParams?.prefix ? decodeURIComponent(searchParams.prefix) : ""
  const safeSegments = rawPrefix
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && !segment.includes(".."))
  const normalizedPrefix = safeSegments.length ? `${safeSegments.join("/")}/` : ""

  const breadcrumbSegments = normalizedPrefix ? normalizedPrefix.slice(0, -1).split("/") : []
  const breadcrumbs = [] as Array<{ label: string; href: string; active: boolean }>

  breadcrumbs.push({ label: "Root", href: "/admin", active: breadcrumbSegments.length === 0 })

  if (breadcrumbSegments.length > 0) {
    let cumulative = ""
    breadcrumbSegments.forEach((segment, index) => {
      cumulative += `${segment}/`
      breadcrumbs.push({
        label: segment,
        href: `/admin?prefix=${encodeURIComponent(cumulative)}`,
        active: index === breadcrumbSegments.length - 1,
      })
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <section className={cn(spacing.section, "py-20")}>
        <div className={cn(spacing.containerWide, "space-y-8")}>
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Title as="h1" margin="none">
                Archivio cosecase.it
              </Title>
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Home
                </Link>
                <Link
                  href="/admin/upload"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-primary-foreground shadow-sm transition hover:bg-brand-primary/90"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Carica nuovo
                </Link>
              </div>
            </div>
            <p className={cn(typography.sectionSubtitle)}>
              Consulta cartelle e file salvati su Blob. Naviga nella struttura e rimuovi gli asset che non ti servono più.
            </p>
            <nav aria-label="Percorso corrente" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-2">
                  {index > 0 ? <span className="text-border">/</span> : null}
                  {crumb.active ? (
                    <span className="font-semibold text-foreground">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} prefetch={false} className="transition hover:text-brand-primary">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <BlobList prefix={normalizedPrefix} />
        </div>
      </section>
    </div>
  )
}
