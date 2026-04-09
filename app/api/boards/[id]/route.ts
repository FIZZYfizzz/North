import { getSessionFromRequest } from '@/lib/auth'
import { getBoardDetail } from '@/services/board.service'
import { apiSuccess, apiError } from '@/lib/utils'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const board = await getBoardDetail(id, session.userId)
  if (!board) return apiError('Board not found', 404)

  return apiSuccess(board)
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const body = await request.json() as { name?: string; description?: string; coverColor?: string }

  const board = await db.board.findFirst({
    where: { id, workspace: { members: { some: { userId: session.userId } } } },
    select: { id: true },
  })
  if (!board) return apiError('Board not found', 404)

  const updated = await db.board.update({ where: { id }, data: body })
  return apiSuccess(updated)
}
