/**
 * server/index.ts
 *
 * Custom HTTP server that hosts both:
 *   - Next.js (App Router) as the web framework
 *   - Socket.io for real-time collaboration
 *
 * Why a custom server?
 * Next.js's built-in server does not expose the underlying http.Server,
 * which Socket.io requires for WebSocket handshakes. A custom server gives
 * us full control over the HTTP lifecycle while keeping Next.js intact.
 */

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketServer } from 'socket.io'
import { setIO } from '../lib/io'
import { setupSocketHandlers } from './socket'
import type { ClientToServerEvents, ServerToClientEvents } from '../types'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000', 10)

async function main() {
  const app = next({ dev, port })
  const handle = app.getRequestHandler()

  await app.prepare()

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${port}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Use websocket-first, polling as fallback
    transports: ['websocket', 'polling'],
  })

  // Make io available throughout the application
  setIO(io)

  // Register all socket event handlers
  setupSocketHandlers(io)

  httpServer.listen(port, () => {
    console.log(`\n  ▶ North ready on http://localhost:${port}`)
    console.log(`  ▶ Mode: ${dev ? 'development' : 'production'}\n`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
