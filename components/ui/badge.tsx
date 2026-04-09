import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  NONE:   { label: 'No priority', dot: 'bg-[var(--color-priority-none)]'   },
  LOW:    { label: 'Low',         dot: 'bg-[var(--color-priority-low)]'    },
  MEDIUM: { label: 'Medium',      dot: 'bg-[var(--color-priority-medium)]' },
  HIGH:   { label: 'High',        dot: 'bg-[var(--color-priority-high)]'   },
  URGENT: { label: 'Urgent',      dot: 'bg-[var(--color-priority-urgent)]' },
}

interface PriorityBadgeProps {
  priority: Priority
  showLabel?: boolean
}

export function PriorityBadge({ priority, showLabel = false }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  if (priority === 'NONE' && !showLabel) return null

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full shrink-0', config.dot)} />
      {showLabel && (
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {config.label}
        </span>
      )}
    </span>
  )
}

export { priorityConfig }
