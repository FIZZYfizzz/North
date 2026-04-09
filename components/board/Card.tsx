'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/badge'
import { AvatarGroup } from '@/components/ui/avatar'
import { format } from 'date-fns'
import type { CardDetail } from '@/types'

interface CardProps {
  card: CardDetail
  columnId: string
  isDragOverlay?: boolean
  onClick?: (card: CardDetail) => void
}

// Priority → border-left accent color
const priorityBorder: Record<string, string> = {
  NONE:   'var(--color-priority-none)',
  LOW:    'var(--color-priority-low)',
  MEDIUM: 'var(--color-priority-medium)',
  HIGH:   'var(--color-priority-high)',
  URGENT: 'var(--color-priority-urgent)',
}

export function KanbanCard({ card, columnId, isDragOverlay = false, onClick }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', columnId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // onClick fires on tap/click (pointer moved <8px, so drag never started)
      onClick={!isDragging ? () => onClick?.(card) : undefined}
      className={cn(
        'relative rounded-[var(--radius-card)] p-3.5 cursor-pointer active:cursor-grabbing',
        'transition-shadow duration-150',
        isDragging && !isDragOverlay && 'opacity-40',
        isDragOverlay && 'rotate-[1.5deg] shadow-xl',
      )}
    >
      {/* Priority bar */}
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: priorityBorder[card.priority] }}
      />

      <div
        className="rounded-[var(--radius-card)] px-3 py-3"
        style={{
          background: 'var(--bg-card)',
          boxShadow: isDragOverlay ? 'var(--shadow-panel)' : 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Title */}
        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
          {card.title}
        </p>

        {/* Footer metadata */}
        {(card.dueDate || card.assignees.length > 0 || card.priority !== 'NONE') && (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={card.priority} />
              {card.dueDate && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {format(new Date(card.dueDate), 'MMM d')}
                </span>
              )}
            </div>

            {card.assignees.length > 0 && (
              <AvatarGroup
                users={card.assignees.map((a) => ({
                  name: a.user.name,
                  avatarUrl: a.user.avatarUrl,
                }))}
                size="xs"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Placeholder shown in the column while a card is being dragged
export function CardPlaceholder() {
  return (
    <div
      className="rounded-[var(--radius-card)] border-2 border-dashed"
      style={{
        height: 72,
        borderColor: 'var(--border-medium)',
        background: 'var(--bg-subtle)',
      }}
    />
  )
}
