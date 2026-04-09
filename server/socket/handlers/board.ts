/**
 * server/socket/handlers/board.ts
 *
 * Handles real-time column movement events.
 * Card creation/update/deletion are handled via REST API routes,
 * which emit socket events using getIO() after persisting to DB.
 */

import type { Server, Socket } from 'socket.io'
import { db } from '../../../lib/db'
import type { ClientToServerEvents, ServerToClientEvents, ColumnMovePayload } from '../../../types'

type IO = Server<ClientToServerEvents, ServerToClientEvents>
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  userId: string
}

export function registerBoardHandlers(io: IO, socket: AppSocket): void {
  socket.on('column:move', async (payload: ColumnMovePayload) => {
    const { columnId, newPosition } = payload

    try {
      const column = await db.column.findFirst({
        where: {
          id: columnId,
          board: {
            workspace: {
              members: { some: { userId: socket.userId } },
            },
          },
        },
        select: { boardId: true },
      })

      if (!column) {
        socket.emit('error', 'Column not found or access denied')
        return
      }

      await db.column.update({
        where: { id: columnId },
        data: { position: newPosition },
      })

      io.to(`board:${column.boardId}`).emit('column:moved', payload)
    } catch (err) {
      console.error('[socket] column:move error:', err)
      socket.emit('error', 'Failed to move column')
    }
  })
}
