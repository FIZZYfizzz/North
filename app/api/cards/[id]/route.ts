import { getSessionFromRequest } from '@/lib/auth'
import { updateCard, deleteCard } from '@/services/card.service'
import { apiSuccess, apiError } from '@/lib/utils'
import type { Priority } from '@/types'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  const body = await request.json() as {
    title?: string
    description?: string
    priority?: Priority
    dueDate?: string | null
  }

  const card = await updateCard(id, session.userId, {
    ...body,
    dueDate: body.dueDate === null ? null : body.dueDate ? new Date(body.dueDate) : undefined,
  })

  return apiSuccess(card)
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const { id } = await params
  await deleteCard(id, session.userId)
  return apiSuccess({ deleted: true })
}
