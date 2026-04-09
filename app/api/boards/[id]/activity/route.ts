import { getSessionFromRequest } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params

  const activity = await db.activity.findMany({
    where: {
      boardId: id,
      board: { workspace: { members: { some: { userId: session.userId } } } },
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return apiSuccess(activity)
}
