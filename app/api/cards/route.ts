import { getSessionFromRequest } from '@/lib/auth'
import { createCard } from '@/services/card.service'
import { apiSuccess, apiError } from '@/lib/utils'
import type { Priority } from '@/types'

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request)
  if (!session) return apiError('Unauthorized', 401)

  const body = await request.json() as {
    columnId?: string
    title?: string
    description?: string
    priority?: Priority
    dueDate?: string
  }

  if (!body.columnId || !body.title?.trim()) return apiError('columnId and title are required')

  const card = await createCard(body.columnId, session.userId, {
    title: body.title.trim(),
    description: body.description,
    priority: body.priority,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
  })

  return apiSuccess(card, 201)
}
