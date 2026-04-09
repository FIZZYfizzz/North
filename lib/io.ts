/**
 * lib/io.ts
 *
 * Exposes the Socket.io Server instance to the rest of the application
 * (services, API routes) without coupling them to the server entrypoint.
 *
 * Usage:
 *   import { getIO } from '@/lib/io'
 *   getIO().to(`board:${boardId}`).emit('card:moved', payload)
 */

import type { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types'

type IO = Server<ClientToServerEvents, ServerToClientEvents>

const globalForIO = globalThis as unknown as { io?: IO }

export function setIO(io: IO): void {
  globalForIO.io = io
}

export function getIO(): IO {
  if (!globalForIO.io) {
    throw new Error('Socket.io server has not been initialized. Call setIO() in server/index.ts first.')
  }
  return globalForIO.io
}
