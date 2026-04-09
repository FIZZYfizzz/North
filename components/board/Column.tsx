'use client'

import { useState, useRef } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { KanbanCard } from './Card'
import { Button } from '@/components/ui/button'
import type { ColumnWithCards } from '@/types'

interface ColumnProps {
  column: ColumnWithCards
  isDragOverlay?: boolean
  onCardCreate: (columnId: string, title: string) => void
  onCardClick?: (card: import('@/types').CardDetail) => void
}

export function KanbanColumn({ column, isDragOverlay = false, onCardCreate, onCardClick }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const cardIds = column.cards.map((c) => c.id)

  function handleAddCard() {
    const title = newCardTitle.trim()
    if (!title) return
    onCardCreate(column.id, title)
    setNewCardTitle('')
    setIsAddingCard(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-col w-72 shrink-0 rounded-[var(--radius-panel)] transition-opacity duration-150',
        isDragging && !isDragOverlay && 'opacity-40',
        isDragOverlay && 'rotate-[0.8deg]',
      )}
    >
      {/* Column header — drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing"
        style={{
          background: 'var(--bg-column)',
          borderRadius: 'var(--radius-panel) var(--radius-panel) 0 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          {column.color && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: column.color }}
            />
          )}
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {column.name}
          </h3>
          <span
            className="text-xs tabular-nums"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {column.cards.length}
          </span>
        </div>
      </div>

      {/* Cards area */}
      <div
        className="flex-1 flex flex-col gap-2 p-2 min-h-[80px] overflow-y-auto"
        style={{
          background: 'var(--bg-column)',
          maxHeight: 'calc(100vh - 200px)',
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} columnId={column.id} onClick={onCardClick} />
          ))}
        </SortableContext>

        {/* Inline new card form */}
        {isAddingCard && (
          <div
            className="rounded-[var(--radius-card)] p-2 mt-1"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <input
              ref={inputRef}
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCard()
                if (e.key === 'Escape') setIsAddingCard(false)
              }}
              placeholder="Card title…"
              className="w-full text-sm bg-transparent outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            <div className="flex gap-1.5 mt-2">
              <Button size="sm" onClick={handleAddCard}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingCard(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Add card button */}
      {!isAddingCard && (
        <button
          onClick={() => {
            setIsAddingCard(true)
            setTimeout(() => inputRef.current?.focus(), 10)
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium w-full transition-colors duration-150"
          style={{
            background: 'var(--bg-column)',
            color: 'var(--text-tertiary)',
            borderRadius: '0 0 var(--radius-panel) var(--radius-panel)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
        >
          <span className="text-base leading-none">+</span>
          Add card
        </button>
      )}
    </div>
  )
}
