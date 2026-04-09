'use client'

import { cn } from '@/lib/utils'
import { priorityConfig } from '@/components/ui/badge'
import type { Priority } from '@/types'

const ALL_PRIORITIES: Priority[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

interface PrioritySelectProps {
  value: Priority
  onChange: (value: Priority) => void
}

export function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ALL_PRIORITIES.map((p) => {
        const { label, dot } = priorityConfig[p]
        const isActive = value === p

        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-100',
              isActive
                ? 'ring-2 ring-[var(--color-brand)] ring-offset-1 ring-offset-[var(--bg-elevated)]'
                : 'opacity-60 hover:opacity-90',
            )}
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            <span className={cn('h-2 w-2 rounded-full shrink-0', dot)} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
