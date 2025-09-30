import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import { hasConfiguredAdminEmails, isAdminUser } from "@/lib/admin-auth"
import { AdminLogoutButton } from "./admin-logout-button"

export const dynamic = "force-dynamic"

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in?redirect_url=/admin")
  }

  if (!hasConfiguredAdminEmails || !isAdminUser(user)) {
    redirect("/?adminAccess=denied")
  }

  return (
    <>
      <div className="fixed right-6 top-4 z-50">
        <AdminLogoutButton />
      </div>
      {children}
    </>
  )
}
