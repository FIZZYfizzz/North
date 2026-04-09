import { getSessionFromRequest } from '@/lib/auth'
import { assignCard, unassignCard } from '@/services/card.service'
import { apiSuccess, apiError } from '@/lib/utils'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const { userId } = await request.json() as { userId?: string }
  if (!userId) return apiError('userId is required')

  await assignCard(id, userId, session.userId)
  return apiSuccess({ assigned: true })
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const { userId } = await request.json() as { userId?: string }
  if (!userId) return apiError('userId is required')

  await unassignCard(id, userId, session.userId)
  return apiSuccess({ unassigned: true })
}
