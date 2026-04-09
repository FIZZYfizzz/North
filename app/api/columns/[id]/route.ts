import { getSessionFromRequest } from '@/lib/auth'
import { renameColumn, deleteColumn } from '@/services/board.service'
import { apiSuccess, apiError } from '@/lib/utils'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const body = await request.json() as { name?: string }
  if (!body.name?.trim()) return apiError('name is required')

  const column = await renameColumn(id, session.userId, body.name.trim())
  return apiSuccess(column)
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  await deleteColumn(id, session.userId)
  return apiSuccess({ deleted: true })
}
