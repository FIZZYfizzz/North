/**
 * services/card.service.ts
 *
 * Card CRUD logic. Emits socket events after each mutation so all
 * connected users receive updates in real-time.
 */

import { db } from '@/lib/db'
import { getIO } from '@/lib/io'
import { getBetweenPosition } from '@/lib/utils'
import type { Priority, CardDetail } from '@/types'

interface CreateCardInput {
  title: string
  description?: string
  priority?: Priority
  dueDate?: Date
}

interface UpdateCardInput {
  title?: string
  description?: string
  priority?: Priority
  dueDate?: Date | null
}

async function assertCardAccess(cardId: string, userId: string) {
  const card = await db.card.findFirst({
    where: {
      id: cardId,
      column: { board: { workspace: { members: { some: { userId } } } } },
    },
    include: { column: { select: { boardId: true } } },
  })
  if (!card) throw new Error('Card not found or access denied')
  return card
}

export async function createCard(columnId: string, userId: string, data: CreateCardInput) {
  const column = await db.column.findFirst({
    where: {
      id: columnId,
      board: { workspace: { members: { some: { userId } } } },
    },
    select: { boardId: true },
  })
  if (!column) throw new Error('Column not found or access denied')

  const lastCard = await db.card.findFirst({
    where: { columnId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const position = getBetweenPosition(lastCard?.position ?? null, null)

  const card = await db.card.create({
    data: {
      ...data,
      columnId,
      position,
    },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
    },
  })

  await db.activity.create({
    data: { type: 'CARD_CREATED', userId, boardId: column.boardId, cardId: card.id },
  })

  try {
    getIO()
      .to(`board:${column.boardId}`)
      .emit('card:created', { ...card, columnId } as CardDetail & { columnId: string })
  } catch {
    // swallow
  }

  return card
}

export async function updateCard(cardId: string, userId: string, data: UpdateCardInput) {
  const existing = await assertCardAccess(cardId, userId)

  const card = await db.card.update({
    where: { id: cardId },
    data,
    include: {
      assignees: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
    },
  })

  await db.activity.create({
    data: {
      type: 'CARD_UPDATED',
      userId,
      boardId: existing.column.boardId,
      cardId,
      payload: data,
    },
  })

  try {
    getIO()
      .to(`board:${existing.column.boardId}`)
      .emit('card:updated', { id: cardId, ...data })
  } catch {
    // swallow
  }

  return card
}

export async function deleteCard(cardId: string, userId: string) {
  const existing = await assertCardAccess(cardId, userId)

  await db.card.delete({ where: { id: cardId } })

  try {
    getIO()
      .to(`board:${existing.column.boardId}`)
      .emit('card:deleted', { id: cardId, columnId: existing.columnId })
  } catch {
    // swallow
  }
}

export async function assignCard(cardId: string, assigneeId: string, requesterId: string) {
  const existing = await assertCardAccess(cardId, requesterId)

  await db.cardAssignee.upsert({
    where: { cardId_userId: { cardId, userId: assigneeId } },
    create: { cardId, userId: assigneeId },
    update: {},
  })

  await db.activity.create({
    data: {
      type: 'CARD_ASSIGNED',
      userId: requesterId,
      boardId: existing.column.boardId,
      cardId,
      payload: { assigneeId },
    },
  })
}

export async function unassignCard(cardId: string, assigneeId: string, requesterId: string) {
  await assertCardAccess(cardId, requesterId)

  await db.cardAssignee.delete({
    where: { cardId_userId: { cardId, userId: assigneeId } },
  })
}
