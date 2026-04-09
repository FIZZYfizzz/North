/**
 * server/socket/index.ts
 *
 * Central Socket.io setup. Handles authentication, room management,
 * and delegates domain events to feature-specific handlers.
 *
 * Room strategy:
 *   board:{boardId}  — All users viewing a specific board.
 *                      Card and column events are scoped to this room.
 */

import type { Server, Socket } from 'socket.io'
import { verifyToken } from '../../lib/auth'
import { db } from '../../lib/db'
import type { ClientToServerEvents, ServerToClientEvents } from '../../types'
import { registerBoardHandlers } from './handlers/board'
import { registerCardHandlers } from './handlers/card'

type IO = Server<ClientToServerEvents, ServerToClientEvents>
type AuthenticatedSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  userId: string
  userName: string
  userAvatar: string | null
}

// Active board presence: boardId → Set of { userId, name, avatarUrl }
const boardPresence = new Map<string, Map<string, { name: string; avatarUrl: string | null }>>()

export function setupSocketHandlers(io: IO): void {
  // ─── Authentication middleware ─────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token as string | undefined ??
        socket.handshake.headers.cookie?.match(/north_session=([^;]+)/)?.[1]

      if (!token) return next(new Error('Authentication required'))

      const payload = await verifyToken(token)
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, avatarUrl: true },
      })

      if (!user) return next(new Error('User not found'))

      const s = socket as AuthenticatedSocket
      s.userId = user.id
      s.userName = user.name
      s.userAvatar = user.avatarUrl

      next()
    } catch {
      next(new Error('Invalid session'))
    }
  })

  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket

    console.log(`[socket] connected: ${socket.userId} (${socket.id})`)

    // ─── Board room management ───────────────────────────────────────────────

    socket.on('board:join', async (boardId) => {
      // Verify the user has access to this board
      const board = await db.board.findFirst({
        where: {
          id: boardId,
          workspace: {
            members: { some: { userId: socket.userId } },
          },
        },
        select: { id: true },
      })

      if (!board) {
        socket.emit('error', 'Board not found or access denied')
        return
      }

      socket.join(`board:${boardId}`)

      // Track presence
      if (!boardPresence.has(boardId)) boardPresence.set(boardId, new Map())
      boardPresence.get(boardId)!.set(socket.userId, {
        name: socket.userName,
        avatarUrl: socket.userAvatar,
      })

      // Broadcast updated presence to everyone in the room
      broadcastPresence(io, boardId)
    })

    socket.on('board:leave', (boardId) => {
      socket.leave(`board:${boardId}`)
      boardPresence.get(boardId)?.delete(socket.userId)
      broadcastPresence(io, boardId)
    })

    // Clean up presence on disconnect
    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.userId} (${socket.id})`)
      boardPresence.forEach((users, boardId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId)
          broadcastPresence(io, boardId)
        }
      })
    })

    // ─── Domain handlers ─────────────────────────────────────────────────────

    registerBoardHandlers(io, socket)
    registerCardHandlers(io, socket)
  })
}

function broadcastPresence(io: IO, boardId: string): void {
  const users = Array.from(boardPresence.get(boardId)?.entries() ?? []).map(
    ([userId, info]) => ({ userId, ...info }),
  )

  io.to(`board:${boardId}`).emit('presence:update', { boardId, users })
}
