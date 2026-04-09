import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { Sidebar } from '@/components/layout/Sidebar'
import type { BoardSummary, UserPublic } from '@/types'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<Record<string, string>>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const resolvedParams = await params
  const slug = resolvedParams['slug'] as string | undefined

  let workspaceData: { name: string; slug: string } | null = null
  let boards: BoardSummary[] = []
  let allWorkspaces: { name: string; slug: string }[] = []

  async function loadWorkspace(workspaceSlug: string) {
    return db.workspace.findFirst({
      where: { slug: workspaceSlug, members: { some: { userId: user!.id } } },
      select: {
        name: true,
        slug: true,
        boards: {
          where: { isArchived: false },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true, name: true, description: true,
            coverColor: true, isArchived: true, createdAt: true, updatedAt: true,
          },
        },
      },
    })
  }

  if (slug) {
    const ws = await loadWorkspace(slug)
    if (ws) {
      workspaceData = { name: ws.name, slug: ws.slug }
      boards = ws.boards
    }
  }

  // Fallback: first workspace the user belongs to
  if (!workspaceData) {
    const first = await db.workspaceMember.findFirst({
      where: { userId: user.id },
      include: {
        workspace: {
          select: {
            name: true, slug: true,
            boards: {
              where: { isArchived: false },
              orderBy: { createdAt: 'asc' },
              select: {
                id: true, name: true, description: true,
                coverColor: true, isArchived: true, createdAt: true, updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })
    if (first) {
      workspaceData = { name: first.workspace.name, slug: first.workspace.slug }
      boards = first.workspace.boards
    }
  }

  // Fetch all workspaces the user belongs to for the switcher
  const allMemberships = await db.workspaceMember.findMany({
    where: { userId: user.id },
    include: { workspace: { select: { name: true, slug: true } } },
    orderBy: { joinedAt: 'asc' },
  })
  allWorkspaces = allMemberships.map((m) => ({ name: m.workspace.name, slug: m.workspace.slug }))

  const sidebarUser: UserPublic = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {workspaceData && (
        <Sidebar workspace={workspaceData} boards={boards} user={sidebarUser} allWorkspaces={allWorkspaces} />
      )}

      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
