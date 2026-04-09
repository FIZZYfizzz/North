import { getSessionFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params

  const members = await db.workspaceMember.findMany({
    where: {
      workspaceId: id,
      workspace: { members: { some: { userId: session.userId } } },
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })

  if (!members.length) return apiError('Workspace not found', 404)

  return apiSuccess(members.map((m) => m.user))
}
