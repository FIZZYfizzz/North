'use client'

/**
 * hooks/useBoard.ts
 *
 * Zustand store + socket subscriptions for a single board.
 *
 * This hook:
 *   1. Holds the board state (columns + cards) as returned by the API
 *   2. Joins the Socket.io board room on mount, leaves on unmount
 *   3. Applies optimistic updates for drag-and-drop
 *   4. Syncs real-time changes from other users via socket events
 */

import { useEffect } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useSocket } from './useSocket'
import type {
  BoardDetail,
  ColumnWithCards,
  CardDetail,
  CardMovePayload,
  ColumnMovePayload,
  PresencePayload,
} from '@/types'

// ─── Store shape ──────────────────────────────────────────────────────────────

interface BoardState {
  board: BoardDetail | null
  presence: PresencePayload['users']

  // Setters
  setBoard: (board: BoardDetail) => void
  applyCardMove: (payload: CardMovePayload) => void
  applyColumnMove: (payload: ColumnMovePayload) => void
  applyCardCreated: (card: CardDetail & { columnId: string }) => void
  applyCardUpdated: (card: Partial<CardDetail> & { id: string }) => void
  applyCardDeleted: (payload: { id: string; columnId: string }) => void
  applyColumnCreated: (column: ColumnWithCards) => void
  applyColumnUpdated: (payload: { id: string; name?: string; color?: string }) => void
  applyColumnDeleted: (payload: { id: string }) => void
  setPresence: (payload: PresencePayload) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useBoardStore = create<BoardState>()(
  immer((set) => ({
    board: null,
    presence: [],

    setBoard: (board) => set({ board }),

    applyCardMove: ({ cardId, fromColumnId, toColumnId, newPosition }) =>
      set((state) => {
        if (!state.board) return
        const fromCol = state.board.columns.find((c) => c.id === fromColumnId)
        const toCol = state.board.columns.find((c) => c.id === toColumnId)
        if (!fromCol || !toCol) return

        const cardIndex = fromCol.cards.findIndex((c) => c.id === cardId)
        if (cardIndex === -1) return

        const [card] = fromCol.cards.splice(cardIndex, 1)
        if (!card) return
        card.position = newPosition
        card.columnId = toColumnId
        toCol.cards.push(card)
        toCol.cards.sort((a, b) => a.position - b.position)
      }),

    applyColumnMove: ({ columnId, newPosition }) =>
      set((state) => {
        if (!state.board) return
        const col = state.board.columns.find((c) => c.id === columnId)
        if (col) {
          col.position = newPosition
          state.board.columns.sort((a, b) => a.position - b.position)
        }
      }),

    applyCardCreated: (card) =>
      set((state) => {
        if (!state.board) return
        const col = state.board.columns.find((c) => c.id === card.columnId)
        col?.cards.push(card)
      }),

    applyCardUpdated: (update) =>
      set((state) => {
        if (!state.board) return
        for (const col of state.board.columns) {
          const card = col.cards.find((c) => c.id === update.id)
          if (card) {
            Object.assign(card, update)
            return
          }
        }
      }),

    applyCardDeleted: ({ id, columnId }) =>
      set((state) => {
        if (!state.board) return
        const col = state.board.columns.find((c) => c.id === columnId)
        if (col) col.cards = col.cards.filter((c) => c.id !== id)
      }),

    applyColumnCreated: (column) =>
      set((state) => {
        state.board?.columns.push(column)
      }),

    applyColumnUpdated: (update) =>
      set((state) => {
        if (!state.board) return
        const col = state.board.columns.find((c) => c.id === update.id)
        if (col) Object.assign(col, update)
      }),

    applyColumnDeleted: ({ id }) =>
      set((state) => {
        if (!state.board) return
        state.board.columns = state.board.columns.filter((c) => c.id !== id)
      }),

    setPresence: (payload) =>
      set((state) => {
        if (state.board?.id === payload.boardId) {
          state.presence = payload.users
        }
      }),
  })),
)

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBoard(boardId: string) {
  const socket = useSocket()
  const store = useBoardStore()

  useEffect(() => {
    if (!socket) return

    socket.emit('board:join', boardId)

    socket.on('card:moved', store.applyCardMove)
    socket.on('card:created', store.applyCardCreated)
    socket.on('card:updated', store.applyCardUpdated)
    socket.on('card:deleted', store.applyCardDeleted)
    socket.on('column:moved', store.applyColumnMove)
    socket.on('column:created', store.applyColumnCreated)
    socket.on('column:updated', store.applyColumnUpdated)
    socket.on('column:deleted', store.applyColumnDeleted)
    socket.on('presence:update', store.setPresence)

    return () => {
      socket.emit('board:leave', boardId)
      socket.off('card:moved', store.applyCardMove)
      socket.off('card:created', store.applyCardCreated)
      socket.off('card:updated', store.applyCardUpdated)
      socket.off('card:deleted', store.applyCardDeleted)
      socket.off('column:moved', store.applyColumnMove)
      socket.off('column:created', store.applyColumnCreated)
      socket.off('column:updated', store.applyColumnUpdated)
      socket.off('column:deleted', store.applyColumnDeleted)
      socket.off('presence:update', store.setPresence)
    }
  }, [socket, boardId]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    board: store.board,
    presence: store.presence,
    setBoard: store.setBoard,
  }
}
