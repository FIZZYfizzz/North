import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Root page — determines where to send the user.
 *
 * Authenticated  → first workspace, or workspace creation
 * Unauthenticated → login
 */
export default async function RootPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Find the first workspace the user belongs to
  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.userId },
    include: { workspace: { select: { slug: true } } },
    orderBy: { joinedAt: 'asc' },
  })

  if (!membership) {
    // New user with no workspace yet
    redirect('/onboarding')
  }

  redirect(`/workspace/${membership.workspace.slug}`)
}
