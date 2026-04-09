import { getSessionFromRequest } from '@/lib/auth'
import { createColumn } from '@/services/board.service'
import { apiSuccess, apiError } from '@/lib/utils'

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const body = await request.json() as { boardId?: string; name?: string }
  if (!body.boardId || !body.name?.trim()) return apiError('boardId and name are required')

  const column = await createColumn(body.boardId, session.userId, body.name.trim())
  return apiSuccess(column, 201)
}
