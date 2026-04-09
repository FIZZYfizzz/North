'use client'

/**
 * BoardView — the interactive board canvas.
 *
 * State strategy:
 *   - `localColumns` (useState) drives all rendering — responsive to both
 *     DnD interactions and real-time socket events.
 *   - `useBoard` (Zustand + socket) syncs remote changes into localColumns via useEffect.
 *   - On drag end: update localColumns optimistically, then emit socket event
 *     (which persists to DB + broadcasts to other users).
 */

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'

import { useBoard } from '@/hooks/useBoard'
import { useSocket } from '@/hooks/useSocket'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { getBetweenPosition } from '@/lib/utils'
import { KanbanColumn } from './Column'
import { KanbanCard } from './Card'
import { CardModal } from './CardModal'
import { ActivityFeed } from './ActivityFeed'
import { EmptyBoard } from './EmptyBoard'
import { PresenceAvatars } from './PresenceAvatars'
import { Button } from '@/components/ui/button'
import type { BoardDetail, ColumnWithCards, CardDetail } from '@/types'

interface BoardViewProps {
  initialBoard: BoardDetail
  workspaceId: string
  currentUserId: string
}

type ActiveItem =
  | { type: 'column'; column: ColumnWithCards }
  | { type: 'card'; card: CardDetail; columnId: string }
  | null

export function BoardView({ initialBoard, workspaceId, currentUserId }: BoardViewProps) {
  // Local columns state — drives all rendering
  const [localColumns, setLocalColumns] = useState<ColumnWithCards[]>(initialBoard.columns)
  const [activeItem, setActiveItem] = useState<ActiveItem>(null)
  const [selectedCard, setSelectedCard] = useState<CardDetail | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  // Real-time sync: when Zustand board state changes (from socket), sync local
  const { board, presence, setBoard } = useBoard(initialBoard.id)
  const socket = useSocket()

  // Seed Zustand with SSR data on mount
  useEffect(() => {
    setBoard(initialBoard)
  }, [initialBoard, setBoard])

  // Sync local columns when socket/Zustand updates arrive
  useEffect(() => {
    if (board) setLocalColumns(board.columns)
  }, [board])

  // ─── DnD sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const columnIds = localColumns.map((c) => c.id)

  // ─── DnD handlers ─────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type: 'column' | 'card'; columnId?: string }

    if (data.type === 'column') {
      const col = localColumns.find((c) => c.id === event.active.id)
      if (col) setActiveItem({ type: 'column', column: col })
    } else {
      const col = localColumns.find((c) => c.id === data.columnId)
      const card = col?.cards.find((c) => c.id === event.active.id)
      if (card && col) setActiveItem({ type: 'card', card, columnId: col.id })
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as { type: string; columnId?: string }
    if (activeData.type !== 'card') return

    const fromColumnId = activeData.columnId!
    const overData = over.data.current as { type?: string; columnId?: string } | undefined

    // Determine the target column
    const toColumnId =
      overData?.type === 'card' ? overData.columnId! :
      overData?.type === 'column' ? (over.id as string) :
      fromColumnId

    if (fromColumnId === toColumnId) return

    // Move card between columns locally (visual preview)
    setLocalColumns((cols) => {
      const next = cols.map((c) => ({ ...c, cards: [...c.cards] }))
      const fromCol = next.find((c) => c.id === fromColumnId)
      const toCol = next.find((c) => c.id === toColumnId)
      if (!fromCol || !toCol) return cols

      const cardIdx = fromCol.cards.findIndex((c) => c.id === active.id)
      if (cardIdx === -1) return cols

      const [card] = fromCol.cards.splice(cardIdx, 1)
      if (!card) return cols
      toCol.cards.push({ ...card, columnId: toColumnId })
      return next
    })

    // Update activeItem so the overlay reflects the new column
    if (activeItem?.type === 'card') {
      setActiveItem((prev) => prev ? { ...prev, columnId: toColumnId } : null)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveItem(null)

    if (!over || active.id === over.id) return

    const activeData = active.data.current as { type: string; columnId?: string }

    if (activeData.type === 'column') {
      handleColumnDrop(active.id as string, over.id as string)
    } else {
      handleCardDrop(active.id as string)
    }
  }

  function handleColumnDrop(activeId: string, overId: string) {
    setLocalColumns((cols) => {
      const oldIndex = cols.findIndex((c) => c.id === activeId)
      const newIndex = cols.findIndex((c) => c.id === overId)
      if (oldIndex === -1 || newIndex === -1) return cols

      const reordered = arrayMove(cols, oldIndex, newIndex)

      // Calculate new position from neighbors
      const before = reordered[newIndex - 1]?.position ?? null
      const after = reordered[newIndex + 1]?.position ?? null
      const newPosition = getBetweenPosition(before, after)

      reordered[newIndex]!.position = newPosition

      // Persist via socket
      socket?.emit('column:move', { columnId: activeId, newPosition })

      return reordered
    })
  }

  function handleCardDrop(activeCardId: string) {
    // Find card's current state in localColumns (after onDragOver may have moved it)
    let foundCard: CardDetail | undefined
    let foundColumnId: string | undefined

    for (const col of localColumns) {
      const card = col.cards.find((c) => c.id === activeCardId)
      if (card) {
        foundCard = card
        foundColumnId = col.id
        break
      }
    }

    if (!foundCard || !foundColumnId) return

    // Calculate position among siblings in the target column
    setLocalColumns((cols) => {
      const col = cols.find((c) => c.id === foundColumnId)
      if (!col) return cols

      const idx = col.cards.findIndex((c) => c.id === activeCardId)
      const before = col.cards[idx - 1]?.position ?? null
      const after = col.cards[idx + 1]?.position ?? null
      const newPosition = getBetweenPosition(before, after)

      const updatedCards = col.cards.map((c) =>
        c.id === activeCardId ? { ...c, position: newPosition } : c,
      )

      socket?.emit('card:move', {
        cardId: activeCardId,
        fromColumnId: activeItem?.type === 'card' ? activeItem.columnId : foundColumnId!,
        toColumnId: foundColumnId!,
        newPosition,
      })

      return cols.map((c) =>
        c.id === foundColumnId ? { ...c, cards: updatedCards } : c,
      )
    })
  }

  // ─── Card click (open modal) ───────────────────────────────────────────────

  const handleCardClick = useCallback((card: CardDetail) => {
    setSelectedCard(card)
  }, [])

  // When CardModal saves a field, propagate to localColumns
  const handleCardUpdated = useCallback((update: Partial<CardDetail> & { id: string }) => {
    setLocalColumns((cols) =>
      cols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === update.id ? { ...c, ...update } : c)),
      })),
    )
    // Also update selectedCard so modal reflects the change
    setSelectedCard((prev) => (prev?.id === update.id ? { ...prev, ...update } : prev))
  }, [])

  // ─── Card creation ─────────────────────────────────────────────────────────

  const handleCardCreate = useCallback(async (columnId: string, title: string) => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, title }),
    })
    if (!res.ok) return
    // Socket event from server will update Zustand → localColumns via useEffect
  }, [])

  // ─── Column creation ───────────────────────────────────────────────────────

  async function handleColumnCreate() {
    const name = newColumnName.trim()
    if (!name) return

    await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: initialBoard.id, name }),
    })

    setNewColumnName('')
    setIsAddingColumn(false)
    // Socket event will update the board
  }

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────

  useKeyboardShortcuts([
    {
      key: 'n',
      handler: () => setIsAddingColumn(true),
    },
    {
      key: 'a',
      handler: () => setShowActivity((v) => !v),
    },
  ])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4 shrink-0 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-5 min-w-0">
          <h1 className="text-lg font-semibold shrink-0" style={{ color: 'var(--text-primary)' }}>
            {initialBoard.name}
          </h1>
          <PresenceAvatars users={presence} currentUserId={currentUserId} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowActivity((v) => !v)}
          style={{ color: showActivity ? 'var(--color-brand)' : undefined }}
        >
          Activity
        </Button>
      </div>

      {/* Board canvas + optional activity panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Empty state — shown before any columns are added */}
          {localColumns.length === 0 && !isAddingColumn ? (
            <EmptyBoard onAddColumn={() => setIsAddingColumn(true)} />
          ) : (
          <div className="flex items-start gap-4 p-6 h-full min-h-0">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {localColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onCardCreate={handleCardCreate}
                  onCardClick={handleCardClick}
                />
              ))}
            </SortableContext>

            {/* Add column */}
            {isAddingColumn ? (
              <div
                className="w-72 shrink-0 rounded-[var(--radius-panel)] p-3 flex flex-col gap-2"
                style={{ background: 'var(--bg-column)', border: '1px solid var(--border-subtle)' }}
              >
                <input
                  autoFocus
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleColumnCreate()
                    if (e.key === 'Escape') setIsAddingColumn(false)
                  }}
                  placeholder="Column name…"
                  className="text-sm bg-transparent outline-none px-1"
                  style={{ color: 'var(--text-primary)' }}
                />
                <div className="flex gap-1.5">
                  <Button size="sm" onClick={handleColumnCreate}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-72 shrink-0 flex items-center gap-2 rounded-[var(--radius-panel)] px-4 py-3 text-sm font-medium transition-colors duration-150"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-tertiary)',
                  border: '1px dashed var(--border-medium)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
              >
                <span className="text-base leading-none">+</span>
                Add column
              </button>
            )}
          </div>
          )} {/* end empty-state conditional */}

          {/* Drag overlay — renders the floating ghost during drag */}
          {typeof window !== 'undefined' && createPortal(
            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeItem?.type === 'column' && (
                <KanbanColumn
                  column={activeItem.column}
                  isDragOverlay
                  onCardCreate={handleCardCreate}
                />
              )}
              {activeItem?.type === 'card' && (
                <KanbanCard
                  card={activeItem.card}
                  columnId={activeItem.columnId}
                  isDragOverlay
                />
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>

        {/* Activity side panel */}
        {showActivity && (
          <ActivityFeed boardId={initialBoard.id} onClose={() => setShowActivity(false)} />
        )}
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={initialBoard.id}
          workspaceId={workspaceId}
          onClose={() => setSelectedCard(null)}
          onCardUpdated={handleCardUpdated}
        />
      )}
    </div>
  )
}
