import type { User } from "@clerk/nextjs/server"

const adminEmailsEnv = process.env.CLERK_ALLOWED_ADMIN_EMAILS ?? ""

const adminEmailSet = new Set(
  adminEmailsEnv
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0),
)

export const hasConfiguredAdminEmails = adminEmailSet.size > 0

export function getAllowedAdminEmails(): string[] {
  return Array.from(adminEmailSet)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }

  return adminEmailSet.has(email.trim().toLowerCase())
}

export function isAdminUser(user: Pick<User, "emailAddresses"> | null | undefined): boolean {
  if (!user) {
    return false
  }

  return user.emailAddresses?.some((item) => isAdminEmail(item.emailAddress)) ?? false
}
