'use client'

/**
 * hooks/useSocket.ts
 *
 * Manages the Socket.io client connection lifecycle.
 * The socket is created once per session and torn down on unmount.
 *
 * Usage:
 *   const socket = useSocket()
 *   socket?.on('card:moved', handler)
 */

import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// Module-level singleton — one socket for the whole browser session
let _socket: AppSocket | null = null

function getSocket(): AppSocket {
  if (!_socket) {
    _socket = io(process.env.NEXT_PUBLIC_APP_URL ?? '', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  return _socket
}

export function useSocket(): AppSocket | null {
  const socketRef = useRef<AppSocket | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    socket.on('connect', () => {
      console.debug('[socket] connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.debug('[socket] disconnected:', reason)
    })

    socket.on('error', (message) => {
      console.error('[socket] server error:', message)
    })

    return () => {
      // Don't disconnect on component unmount — the socket is a session singleton.
      // Only disconnect when the user logs out.
    }
  }, [])

  return socketRef.current
}

export function disconnectSocket(): void {
  if (_socket) {
    _socket.disconnect()
    _socket = null
  }
}
