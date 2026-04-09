/**
 * services/board.service.ts
 *
 * Board and column business logic.
 * After mutating the DB, emits socket events to broadcast changes.
 */

import { db } from '@/lib/db'
import { getIO } from '@/lib/io'
import { getBetweenPosition } from '@/lib/utils'
import type { ColumnWithCards } from '@/types'

// ─── Board templates ──────────────────────────────────────────────────────────

export type BoardTemplate = 'blank' | 'dev-sprint' | 'simple' | 'marketing'

const TEMPLATES: Record<BoardTemplate, { columns: string[] }> = {
  'blank':     { columns: [] },
  'dev-sprint':{ columns: ['Backlog', 'In Progress', 'Review', 'Done'] },
  'simple':    { columns: ['To Do', 'In Progress', 'Done'] },
  'marketing': { columns: ['Ideas', 'Drafts', 'In Review', 'Published'] },
}

// ─── Boards ───────────────────────────────────────────────────────────────────

export async function createBoard(
  workspaceId: string,
  userId: string,
  data: { name: string; description?: string; coverColor?: string; template?: BoardTemplate },
) {
  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  if (!member) throw new Error('Access denied')

  const { template = 'blank', ...boardData } = data

  const board = await db.board.create({ data: { ...boardData, workspaceId } })

  await db.activity.create({ data: { type: 'BOARD_CREATED', userId, boardId: board.id } })

  // Seed columns from template
  const columnNames = TEMPLATES[template].columns
  if (columnNames.length > 0) {
    await db.column.createMany({
      data: columnNames.map((name, i) => ({
        boardId: board.id,
        name,
        position: (i + 1) * 1000,
      })),
    })
  }

  return board
}

export async function getBoardDetail(boardId: string, userId: string) {
  const board = await db.board.findFirst({
    where: {
      id: boardId,
      workspace: { members: { some: { userId } } },
    },
    include: {
      columns: {
        where: {},
        orderBy: { position: 'asc' },
        include: {
          cards: {
            where: { isArchived: false },
            orderBy: { position: 'asc' },
            include: {
              assignees: {
                include: {
                  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!board) return null
  return board
}

// ─── Columns ──────────────────────────────────────────────────────────────────

export async function createColumn(boardId: string, userId: string, name: string) {
  const board = await db.board.findFirst({
    where: {
      id: boardId,
      workspace: { members: { some: { userId } } },
    },
    select: { id: true },
  })
  if (!board) throw new Error('Board not found or access denied')

  // Place new column at the end
  const lastColumn = await db.column.findFirst({
    where: { boardId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const position = getBetweenPosition(lastColumn?.position ?? null, null)

  const column = await db.column.create({
    data: { boardId, name, position },
    include: { cards: true },
  })

  // Broadcast to all users viewing this board
  try {
    getIO().to(`board:${boardId}`).emit('column:created', column as ColumnWithCards)
  } catch {
    // Socket.io may not be initialized in tests — swallow
  }

  return column
}

export async function renameColumn(columnId: string, userId: string, name: string) {
  const column = await db.column.findFirst({
    where: {
      id: columnId,
      board: { workspace: { members: { some: { userId } } } },
    },
    select: { boardId: true },
  })
  if (!column) throw new Error('Column not found or access denied')

  const updated = await db.column.update({
    where: { id: columnId },
    data: { name },
  })

  try {
    getIO().to(`board:${column.boardId}`).emit('column:updated', { id: columnId, name })
  } catch {
    // swallow
  }

  return updated
}

export async function deleteColumn(columnId: string, userId: string) {
  const column = await db.column.findFirst({
    where: {
      id: columnId,
      board: { workspace: { members: { some: { userId } } } },
    },
    select: { boardId: true },
  })
  if (!column) throw new Error('Column not found or access denied')

  await db.column.delete({ where: { id: columnId } })

  try {
    getIO().to(`board:${column.boardId}`).emit('column:deleted', { id: columnId })
  } catch {
    // swallow
  }
}
