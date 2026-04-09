/**
 * server/socket/handlers/card.ts
 *
 * Handles real-time card movement events.
 * Persists changes to the DB and broadcasts to the board room.
 */

import type { Server, Socket } from 'socket.io'
import { db } from '../../../lib/db'
import type { ClientToServerEvents, ServerToClientEvents, CardMovePayload } from '../../../types'

type IO = Server<ClientToServerEvents, ServerToClientEvents>
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  userId: string
}

export function registerCardHandlers(io: IO, socket: AppSocket): void {
  socket.on('card:move', async (payload: CardMovePayload) => {
    const { cardId, fromColumnId, toColumnId, newPosition } = payload

    try {
      // Verify the card exists and user has board access
      const card = await db.card.findFirst({
        where: {
          id: cardId,
          column: {
            board: {
              workspace: {
                members: { some: { userId: socket.userId } },
              },
            },
          },
        },
        include: { column: { select: { boardId: true } } },
      })

      if (!card) {
        socket.emit('error', 'Card not found or access denied')
        return
      }

      // Persist the move
      await db.card.update({
        where: { id: cardId },
        data: {
          columnId: toColumnId,
          position: newPosition,
        },
      })

      // Broadcast to all users in the board room (including sender)
      io.to(`board:${card.column.boardId}`).emit('card:moved', payload)

      // Log activity
      await db.activity.create({
        data: {
          type: 'CARD_MOVED',
          userId: socket.userId,
          boardId: card.column.boardId,
          cardId,
          payload: {
            fromColumnId,
            toColumnId,
            newPosition,
          },
        },
      })
    } catch (err) {
      console.error('[socket] card:move error:', err)
      socket.emit('error', 'Failed to move card')
    }
  })
}
